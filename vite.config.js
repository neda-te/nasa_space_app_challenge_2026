/**
 * Vite configuration of the local preview.
 *
 * Two things are served / built:
 *
 * 1. The React dashboard (`index.html` -> `src/main.tsx`), bundled by Vite.
 * 2. The emergency flow prototype (`emergency/`), a static page without a build step.
 *    It is served unchanged under `/emergency/` in development and copied to
 *    `dist/emergency/` on build. The dashboard embeds it in an iframe (Help button),
 *    which isolates its styles, scripts, canvas and keyboard shortcuts.
 */

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import { cp, readFile, stat } from 'node:fs/promises'
import path from 'node:path'

const root = fileURLToPath(new URL('.', import.meta.url))
const emergencyDir = path.join(root, 'emergency')

/** @type {Record<string, string>} */
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
}

/**
 * Serves `emergency/` as static files in dev and copies it into the build output.
 *
 * @returns {import('vite').Plugin}
 */
function emergencyPrototype() {
  return {
    name: 'healium-emergency-prototype',
    configureServer(server) {
      server.middlewares.use('/emergency', async (req, res, next) => {
        const urlPath = decodeURIComponent((req.url ?? '/').split('?')[0])
        const file = path.join(emergencyDir, urlPath === '/' ? 'index.html' : urlPath)
        // Never serve anything outside of the emergency folder.
        if (!file.startsWith(emergencyDir + path.sep)) return next()
        try {
          if (!(await stat(file)).isFile()) return next()
          res.setHeader(
            'Content-Type',
            contentTypes[path.extname(file).toLowerCase()] ?? 'application/octet-stream',
          )
          res.end(await readFile(file))
        } catch {
          next()
        }
      })
    },
    async closeBundle() {
      await cp(emergencyDir, path.join(root, 'dist/emergency'), {
        recursive: true,
        filter: (source) => path.basename(source) !== 'README.md',
      })
    },
  }
}

export default defineConfig({
  base: './',
  publicDir: false,
  plugins: [react(), tailwindcss(), emergencyPrototype()],
  server: { open: true },
  test: {
    include: ['src/**/*.test.ts'],
  },
})
