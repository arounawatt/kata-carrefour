/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope

const CACHE_VERSION = 'v1'
const STATIC_CACHE = `eshop-static-${CACHE_VERSION}`
const API_CACHE = `eshop-api-${CACHE_VERSION}`

const STATIC_ASSETS = [
  '/',
  '/index.html',
]

const API_ORIGIN = 'https://dummyjson.com'

// ─── Install ──────────────────────────────────────────────────────────────────
// Pre-cache critical static assets on install so the app shell is always
// available offline after first visit.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  // Skip waiting so the new SW activates immediately without needing a page reload
  self.skipWaiting()
})

// ─── Activate ─────────────────────────────────────────────────────────────────
// Clean up old caches from previous SW versions to avoid stale assets
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== API_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Non-GET requests (POST, etc.) — never cache
  if (request.method !== 'GET') return

  // API requests: stale-while-revalidate
  // Serve cached response immediately while fetching a fresh one in the background
  if (url.origin === API_ORIGIN) {
    event.respondWith(staleWhileRevalidate(request, API_CACHE))
    return
  }

  // Static assets (JS, CSS, fonts): cache-first
  // These are content-hashed by Vite so cache entries are always valid
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  // Navigation requests (HTML): network-first for freshness, fallback to cache
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithFallback(request, STATIC_CACHE))
    return
  }
})

// ─── Strategies ───────────────────────────────────────────────────────────────

/** Cache-first: serve from cache, only go to network on miss */
async function cacheFirst(request: Request, cacheName: string): Promise<Response> {
  const cached = await caches.match(request)
  if (cached) return cached

  const networkResponse = await fetch(request)
  if (networkResponse.ok) {
    const cache = await caches.open(cacheName)
    cache.put(request, networkResponse.clone())
  }
  return networkResponse
}

/** Stale-while-revalidate: serve from cache, update cache in background */
async function staleWhileRevalidate(request: Request, cacheName: string): Promise<Response> {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)

  // Kick off network fetch regardless
  const networkFetch = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  })

  // Return cached immediately if available, otherwise wait for network
  return cached ?? networkFetch
}

/** Network-first: try network, fall back to cache if offline */
async function networkFirstWithFallback(request: Request, cacheName: string): Promise<Response> {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached
    // Last resort: return the cached shell
    return caches.match('/') as Promise<Response>
  }
}
