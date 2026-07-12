import { useEffect, useRef, useState } from 'react'
import {
  Blend,
  Camera,
  CameraOff,
  CircleDot,
  Download,
  Image,
  Pause,
  Play,
  ScanLine,
  Sparkles,
} from 'lucide-react'
import './vision-studio.css'

type EffectMode = 'normal' | 'ghost' | 'portal' | 'blur' | 'replace' | 'cutout'
type SegmenterStatus = 'idle' | 'loading' | 'ready' | 'error'

type ConfidenceMask = {
  width: number
  height: number
  getAsFloat32Array: () => Float32Array
}

type SegmentationResult = {
  confidenceMasks?: ConfidenceMask[]
}

type ImageSegmenterInstance = {
  segmentForVideo: (
    video: HTMLVideoElement,
    timestampMs: number,
    callback: (result: SegmentationResult) => void,
  ) => void
  close: () => void
}

type MediaPipeVisionModule = {
  FilesetResolver: {
    forVisionTasks: (wasmPath: string) => Promise<unknown>
  }
  ImageSegmenter: {
    createFromOptions: (
      vision: unknown,
      options: {
        baseOptions: { modelAssetPath: string; delegate: 'GPU' | 'CPU' }
        runningMode: 'VIDEO'
        outputCategoryMask: false
        outputConfidenceMasks: true
      },
    ) => Promise<ImageSegmenterInstance>
  }
}

const mediaPipeModuleUrl = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/+esm'
const mediaPipeWasmUrl = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm'
const selfieSegmenterModelUrl =
  'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter_landscape/float16/latest/selfie_segmenter_landscape.tflite'

const segmentationEffects: EffectMode[] = ['blur', 'replace', 'cutout']

export default function VisionStudioPanel() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number | null>(null)
  const segmenterRef = useRef<ImageSegmenterInstance | null>(null)
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const personCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const lastSegmentationRef = useRef(0)
  const [cameraOn, setCameraOn] = useState(false)
  const [frozen, setFrozen] = useState(false)
  const [effect, setEffect] = useState<EffectMode>('normal')
  const [opacity, setOpacity] = useState(55)
  const [segmenterStatus, setSegmenterStatus] = useState<SegmenterStatus>('idle')
  const [error, setError] = useState('')

  const stopCamera = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
    animationRef.current = null
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setCameraOn(false)
  }

  useEffect(
    () => () => {
      stopCamera()
      segmenterRef.current?.close()
      segmenterRef.current = null
    },
    [],
  )

  const loadSegmenter = async () => {
    if (segmenterRef.current || segmenterStatus === 'loading') return

    setSegmenterStatus('loading')
    setError('')

    try {
      const visionModule = (await import(
        /* @vite-ignore */ mediaPipeModuleUrl
      )) as MediaPipeVisionModule
      const vision = await visionModule.FilesetResolver.forVisionTasks(mediaPipeWasmUrl)
      segmenterRef.current = await visionModule.ImageSegmenter.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: selfieSegmenterModelUrl,
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        outputCategoryMask: false,
        outputConfidenceMasks: true,
      })
      setSegmenterStatus('ready')
    } catch {
      setSegmenterStatus('error')
      setError('Presenter segmentation could not load. Check your connection and try again.')
    }
  }

  useEffect(() => {
    if (segmentationEffects.includes(effect)) void loadSegmenter()
  }, [effect])

  const updateMask = (result: SegmentationResult) => {
    const confidenceMask = result.confidenceMasks?.[0]
    if (!confidenceMask) return

    const values = confidenceMask.getAsFloat32Array()
    const maskCanvas = maskCanvasRef.current ?? document.createElement('canvas')
    maskCanvasRef.current = maskCanvas
    maskCanvas.width = confidenceMask.width
    maskCanvas.height = confidenceMask.height

    const maskContext = maskCanvas.getContext('2d')
    if (!maskContext) return

    const imageData = maskContext.createImageData(confidenceMask.width, confidenceMask.height)
    for (let index = 0; index < values.length; index += 1) {
      const alpha = Math.round(Math.min(1, Math.max(0, values[index])) * 255)
      const offset = index * 4
      imageData.data[offset] = 255
      imageData.data[offset + 1] = 255
      imageData.data[offset + 2] = 255
      imageData.data[offset + 3] = alpha
    }
    maskContext.putImageData(imageData, 0, 0)
  }

  useEffect(() => {
    if (!cameraOn || frozen) return

    const draw = (timestamp: number) => {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas || video.readyState < 2) {
        animationRef.current = requestAnimationFrame(draw)
        return
      }

      const width = video.videoWidth || 1280
      const height = video.videoHeight || 720
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }

      const context = canvas.getContext('2d')
      if (!context) return

      const sourceCanvas = sourceCanvasRef.current ?? document.createElement('canvas')
      const personCanvas = personCanvasRef.current ?? document.createElement('canvas')
      sourceCanvasRef.current = sourceCanvas
      personCanvasRef.current = personCanvas
      sourceCanvas.width = width
      sourceCanvas.height = height
      personCanvas.width = width
      personCanvas.height = height

      const sourceContext = sourceCanvas.getContext('2d')
      const personContext = personCanvas.getContext('2d')
      if (!sourceContext || !personContext) return

      sourceContext.clearRect(0, 0, width, height)
      sourceContext.save()
      sourceContext.translate(width, 0)
      sourceContext.scale(-1, 1)
      sourceContext.drawImage(video, 0, 0, width, height)
      sourceContext.restore()

      const usesSegmentation = segmentationEffects.includes(effect)
      if (
        usesSegmentation &&
        segmenterRef.current &&
        timestamp - lastSegmentationRef.current >= 66
      ) {
        lastSegmentationRef.current = timestamp
        segmenterRef.current.segmentForVideo(video, timestamp, updateMask)
      }

      context.clearRect(0, 0, width, height)

      if (usesSegmentation && maskCanvasRef.current) {
        personContext.clearRect(0, 0, width, height)
        personContext.drawImage(sourceCanvas, 0, 0, width, height)
        personContext.globalCompositeOperation = 'destination-in'
        personContext.save()
        personContext.translate(width, 0)
        personContext.scale(-1, 1)
        personContext.drawImage(maskCanvasRef.current, 0, 0, width, height)
        personContext.restore()
        personContext.globalCompositeOperation = 'source-over'

        if (effect === 'blur') {
          context.save()
          context.filter = 'blur(18px)'
          context.drawImage(sourceCanvas, -24, -24, width + 48, height + 48)
          context.restore()
          context.drawImage(personCanvas, 0, 0)
        }

        if (effect === 'replace') {
          const gradient = context.createRadialGradient(
            width * 0.48,
            height * 0.38,
            20,
            width * 0.5,
            height * 0.5,
            Math.max(width, height),
          )
          gradient.addColorStop(0, '#342060')
          gradient.addColorStop(0.45, '#11152f')
          gradient.addColorStop(1, '#050816')
          context.fillStyle = gradient
          context.fillRect(0, 0, width, height)
          context.globalAlpha = 0.35
          for (let x = 0; x < width; x += 72) {
            for (let y = 0; y < height; y += 72) {
              context.fillStyle = (x + y) % 144 === 0 ? '#9d7bff' : '#4fc3ff'
              context.beginPath()
              context.arc(x, y, 1.8, 0, Math.PI * 2)
              context.fill()
            }
          }
          context.globalAlpha = 1
          context.drawImage(personCanvas, 0, 0)
        }

        if (effect === 'cutout') {
          context.drawImage(personCanvas, 0, 0)
        }
      } else {
        if (effect === 'ghost') context.globalAlpha = opacity / 100
        context.drawImage(sourceCanvas, 0, 0)
        context.globalAlpha = 1

        if (effect === 'portal') {
          const radius = Math.min(width, height) * 0.22
          const x = width * 0.68
          const y = height * 0.45

          context.save()
          context.beginPath()
          context.arc(x, y, radius, 0, Math.PI * 2)
          context.clip()
          context.globalAlpha = opacity / 100
          context.drawImage(sourceCanvas, 0, 0)
          context.restore()

          const gradient = context.createLinearGradient(
            x - radius,
            y - radius,
            x + radius,
            y + radius,
          )
          gradient.addColorStop(0, 'rgba(128, 220, 255, 0.95)')
          gradient.addColorStop(0.5, 'rgba(179, 121, 255, 0.95)')
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0.9)')
          context.strokeStyle = gradient
          context.lineWidth = Math.max(6, width * 0.008)
          context.shadowBlur = 24
          context.shadowColor = 'rgba(153, 109, 255, 0.9)'
          context.beginPath()
          context.arc(x, y, radius, 0, Math.PI * 2)
          context.stroke()
        }
      }

      context.globalAlpha = 1
      context.filter = 'none'
      context.fillStyle = 'rgba(5, 8, 20, 0.65)'
      context.fillRect(20, height - 58, 245, 36)
      context.fillStyle = '#ffffff'
      context.font = `${Math.max(16, width * 0.015)}px Inter, sans-serif`
      context.fillText('LunarWolf Vision Studio', 34, height - 34)

      animationRef.current = requestAnimationFrame(draw)
    }

    animationRef.current = requestAnimationFrame(draw)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [cameraOn, effect, frozen, opacity])

  const startCamera = async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraOn(true)
      setFrozen(false)
    } catch {
      setError('Camera access was not available. Check the browser permission and try again.')
    }
  }

  const saveFrame = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `lunarwolf-vision-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const chooseEffect = (nextEffect: EffectMode) => {
    setEffect(nextEffect)
    setError('')
  }

  return (
    <div className="vision-studio">
      <div className="vision-stage">
        <video ref={videoRef} muted playsInline className="vision-source" aria-hidden="true" />
        <canvas ref={canvasRef} aria-label="Processed LunarWolf Vision Studio camera preview" />
        {!cameraOn && (
          <div className="vision-placeholder">
            <Sparkles size={34} />
            <strong>Vision effects are ready</strong>
            <span>Your camera stays on this device while the preview is processed.</span>
          </div>
        )}
        {segmenterStatus === 'loading' && (
          <div className="vision-model-status" role="status">
            <ScanLine size={18} /> Loading presenter AI…
          </div>
        )}
      </div>

      <div className="vision-controls">
        <div className="vision-control-section">
          <span className="vision-control-label">Camera effects</span>
          <div className="vision-effect-grid" role="group" aria-label="Camera effect">
            <button
              className={effect === 'normal' ? 'active' : ''}
              onClick={() => chooseEffect('normal')}
              type="button"
            >
              <Camera size={18} /> Normal
            </button>
            <button
              className={effect === 'ghost' ? 'active' : ''}
              onClick={() => chooseEffect('ghost')}
              type="button"
            >
              <Sparkles size={18} /> Ghost
            </button>
            <button
              className={effect === 'portal' ? 'active' : ''}
              onClick={() => chooseEffect('portal')}
              type="button"
            >
              <CircleDot size={18} /> Portal
            </button>
          </div>
        </div>

        <div className="vision-control-section">
          <span className="vision-control-label">AI presenter effects</span>
          <div className="vision-effect-grid" role="group" aria-label="Presenter effect">
            <button
              className={effect === 'blur' ? 'active' : ''}
              onClick={() => chooseEffect('blur')}
              type="button"
            >
              <Blend size={18} /> Blur
            </button>
            <button
              className={effect === 'replace' ? 'active' : ''}
              onClick={() => chooseEffect('replace')}
              type="button"
            >
              <Image size={18} /> Replace
            </button>
            <button
              className={effect === 'cutout' ? 'active' : ''}
              onClick={() => chooseEffect('cutout')}
              type="button"
            >
              <ScanLine size={18} /> Cutout
            </button>
          </div>
        </div>

        {(effect === 'ghost' || effect === 'portal') && (
          <label className="vision-opacity">
            <span>Effect opacity</span>
            <strong>{opacity}%</strong>
            <input
              type="range"
              min="10"
              max="100"
              value={opacity}
              onChange={(event) => setOpacity(Number(event.target.value))}
            />
          </label>
        )}

        <div className="vision-actions">
          {!cameraOn ? (
            <button className="live-studio-primary" type="button" onClick={startCamera}>
              <Camera size={18} /> Start camera
            </button>
          ) : (
            <button className="live-studio-secondary" type="button" onClick={stopCamera}>
              <CameraOff size={18} /> Stop camera
            </button>
          )}
          <button
            className="live-studio-secondary"
            type="button"
            disabled={!cameraOn}
            onClick={() => setFrozen((value) => !value)}
          >
            {frozen ? <Play size={18} /> : <Pause size={18} />}
            {frozen ? 'Resume' : 'Freeze'}
          </button>
          <button
            className="live-studio-secondary"
            type="button"
            disabled={!cameraOn}
            onClick={saveFrame}
          >
            <Download size={18} /> Snapshot
          </button>
        </div>

        {error && (
          <p className="vision-error" role="alert">
            {error}
          </p>
        )}
        <p className="vision-note">
          Phase 2: on-device presenter segmentation for background blur, LunarWolf replacement,
          and transparent cutout output. The model downloads only when an AI effect is selected.
        </p>
      </div>
    </div>
  )
}
