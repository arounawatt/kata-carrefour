import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import { createServer as createViteServer } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(__dirname, '..')

async function createDevServer() {
  const app = express()

  // Create Vite dev server in middleware mode (no separate port)
  // This gives us HMR, module transforms, and SSR support in one process
  const vite = await createViteServer({
    root: rootDir,
    server: { middlewareMode: true },
    appType: 'custom', // We manage routing ourselves
  })

  app.use(vite.middlewares)

  app.use('*', async (req, res, next) => {
    const url = req.originalUrl

    try {
      // Read and transform the HTML template on every request (dev only)
      let template = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8')
      template = await vite.transformIndexHtml(url, template)

      // Load the server entry via Vite (handles HMR, TS transforms, etc.)
      const { render } = await vite.ssrLoadModule('/src/entry-server.tsx')

      const { html: appHtml, dehydratedState } = await render(url)

      // Inject into the template
      const finalHtml = template
        .replace('<!--app-html-->', appHtml)
        .replace('"<!--app-state-->"', JSON.stringify(dehydratedState))
        .replace('<!--app-state-->', JSON.stringify(dehydratedState))

      res.status(200).set({ 'Content-Type': 'text/html' }).end(finalHtml)
    } catch (e) {
      // Let Vite fix source maps for better error messages in dev
      vite.ssrFixStacktrace(e)
      next(e)
    }
  })

  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => {
    console.log(`\n  ◆ KATA dev server running\n`)
    console.log(`  ➜  Local:   http://localhost:${PORT}`)
    console.log(`  ➜  SSR:     enabled\n`)
  })
}

createDevServer()
