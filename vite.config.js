import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import { cp, mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const root = fileURLToPath(new URL('.', import.meta.url))
const localActions = path.join(root, 'local/local-actions.ts')

export default defineConfig({
  base: './',
  publicDir: false,
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'standalone-emergency',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/') req.url = '/dashboard.html'
          next()
        })
        // Serve the original prototype unchanged, including its relative images.
        server.middlewares.use('/emergency', async (req, res, next) => {
          if (req.url !== '/' && req.url !== '/index.html') return next()
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.end(await readFile(path.join(root, 'index.html')))
        })
        server.middlewares.use('/emergency/img', (req, res, next) => {
          req.url = '/img' + req.url
          next()
        })
      },
      async closeBundle() {
        const emergency = path.join(root, 'dist/emergency')
        await mkdir(emergency, { recursive: true })
        await cp(path.join(root, 'index.html'), path.join(emergency, 'index.html'))
        await cp(path.join(root, 'img'), path.join(emergency, 'img'), { recursive: true })
        await cp(path.join(root, 'dist/dashboard.html'), path.join(root, 'dist/index.html'))
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
