/**
 * Registers the Service Worker in production only.
 * Development uses Vite's dev server which doesn't need SW caching.
 *
 * Called from entry-client.tsx after React hydration completes,
 * so it never blocks the critical rendering path.
 */
export function registerServiceWorker(): void {
  if (import.meta.env.DEV) return
  if (!('serviceWorker' in navigator)) return

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('[SW] Registered, scope:', registration.scope)

        // Check for updates every hour
        setInterval(() => registration.update(), 60 * 60 * 1000)
      })
      .catch((error) => {
        console.warn('[SW] Registration failed:', error)
      })
  })
}
