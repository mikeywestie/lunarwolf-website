import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import FlappyWolf from './FlappyWolf'

function BreakRoomPortal() {
  const [host] = useState(() => {
    const mount = document.createElement('div')
    mount.dataset.breakRoomMount = 'true'
    return mount
  })

  useEffect(() => {
    const contact = document.getElementById('contact')
    if (!contact?.parentElement) return

    contact.parentElement.insertBefore(host, contact)

    return () => {
      host.remove()
    }
  }, [host])

  return createPortal(<FlappyWolf />, host)
}

export default BreakRoomPortal
