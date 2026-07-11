import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const pagesBase = '/lunarwolf-software/'

function rewritePublicAssetPaths(): Plugin {
  return {
    name: 'rewrite-public-asset-paths',
    apply: 'build',
    transform(code, id) {
      if (!id.includes('/src/')) return null

      const rewritten = code
        .replaceAll('"/brand/', `"${pagesBase}brand/`)
        .replaceAll("'/brand/", `'${pagesBase}brand/`)

      return rewritten === code ? null : { code: rewritten, map: null }
    },
  }
}

export default defineConfig({
  base: pagesBase,
  plugins: [rewritePublicAssetPaths(), react(), tailwindcss()],
})
