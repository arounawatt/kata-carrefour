import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import compression from 'compression'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(__dirname, '..')
const distDir = path.join(rootDir, 'dist')
const clientDir = path.join(distDir, 'client')

async function createProdServer() {
  const app = express()

  // Gzip/Brotli compression for all responses
  app.use(compression())

  // Serve static assets with long-term caching
  // Vite hashes filenames so we can cache immutably
  app.use(
    '/assets',
    express.static(path.join(clientDir, 'assets'), {
      maxAge: '1y',
      immutable: true,
    })
  )

  // Serve other static files (favicon, etc.) with short cache
  app.use(express.static(clientDir, { maxAge: '1h' }))

  // Read the built HTML template once at startup
  const template = fs.readFileSync(path.join(clientDir, 'index.html'), 'utf-8')

  // Load the built SSR module
  const { render } = await import(path.join(distDir, 'server/entry-server.js'))

  app.use('*', async (req, res, next) => {
    const url = req.originalUrl

    try {
      const { html: appHtml, dehydratedState } = await render(url)

      const finalHtml = template
        .replace('<!--app-html-->', appHtml)
        .replace('<!--app-state-->', JSON.stringify(dehydratedState))

      res
        .status(200)
        .set({
          'Content-Type': 'text/html',
          // Security headers
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
        })
        .end(finalHtml)
    } catch (e) {
      console.error('[SSR Error]', e)
      next(e)
    }
  })

  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => {
    console.log(`\n  ◆ LUMIÈRE production server\n`)
    console.log(`  ➜  Local:   http://localhost:${PORT}\n`)
  })
}

createProdServer()
