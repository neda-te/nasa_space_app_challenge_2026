import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import { cp, mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const root = fileURLToPath(new URL('.', import.meta.url))
const localActions = path.join(root, 'local/local-actions.ts')
async function serveEmergencyImage(req, res) {
  const imageRoot = path.join(root, 'img')
  try {
    const relativePath = decodeURIComponent((req.url ?? '').split('?')[0]).replace(/^[/\\]+/, '')
    const imagePath = path.resolve(imageRoot, relativePath)
    if (!imagePath.startsWith(imageRoot + path.sep)) {
      res.writeHead(404).end()
      return
    }
    const data = await readFile(imagePath)
    const mime = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml' }[path.extname(imagePath).toLowerCase()]
    res.setHeader('Content-Type', mime ?? 'application/octet-stream')
    res.end(data)
  } catch {
    res.writeHead(404).end()
  }
}
const redirectLegacyAuth = (req, res, next) => {
  if (/^\/(?:login|signin|sign-in|register|signup)(?:\/|\?|$)/i.test(req.url ?? '')) {
    res.writeHead(302, { Location: '/' })
    res.end()
    return
  }
  next()
}

export default defineConfig({
  base: './',
  publicDir: false,
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'standalone-emergency',
      configureServer(server) {
        server.middlewares.use(redirectLegacyAuth)
        server.middlewares.use('/vendor/three.min.js', async (req, res) => {
          res.setHeader('Content-Type', 'text/javascript; charset=utf-8')
          res.end(await readFile(path.join(root, 'node_modules/three/build/three.min.js')))
        })
        server.middlewares.use((req, res, next) => {
          if (/^\/(?:index\.html)?(?:\?|$)/.test(req.url ?? '')) {
            req.url = '/dashboard.html' + (req.url?.includes('?') ? req.url.slice(req.url.indexOf('?')) : '')
          }
          next()
        })
        // Serve the isolated emergency document, including its relative images.
        server.middlewares.use('/emergency', async (req, res, next) => {
          const pathname = req.url?.split('?')[0]
          if (pathname !== '/' && pathname !== '/index.html') return next()
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.end(await readFile(path.join(root, 'index.html')))
        })
        server.middlewares.use('/emergency/img', serveEmergencyImage)
      },
      configurePreviewServer(server) {
        server.middlewares.use(redirectLegacyAuth)
      },
      async closeBundle() {
        const emergency = path.join(root, 'dist/emergency')
        await mkdir(emergency, { recursive: true })
        await cp(path.join(root, 'index.html'), path.join(emergency, 'index.html'))
        await cp(path.join(root, 'img'), path.join(emergency, 'img'), { recursive: true })
        await cp(path.join(root, 'dist/dashboard.html'), path.join(root, 'dist/index.html'))
        await cp(path.join(root, 'data'), path.join(root, 'dist/data'), { recursive: true })
        await cp(path.join(root, 'shared'), path.join(root, 'dist/shared'), { recursive: true })
        await mkdir(path.join(root, 'dist/vendor'), { recursive: true })
        await cp(path.join(root, 'node_modules/three/build/three.min.js'), path.join(root, 'dist/vendor/three.min.js'))
      },
    },
  ],
  resolve: {
    alias: [
      { find: /^\.\/dashboard-actions$/, replacement: localActions },
      { find: /^\.\/checkin-actions$/, replacement: localActions },
    ],
  },
  build: { rollupOptions: { input: path.join(root, 'dashboard.html') } },
  server: { open: '/dashboard.html' },
})
