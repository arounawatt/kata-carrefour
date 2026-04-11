import { hydrateRoot } from 'react-dom/client'
import { QueryClient } from '@tanstack/react-query'
import { App } from './App'
import { registerServiceWorker } from './services/sw-register'
import './styles/globals.css'

// Retrieve dehydrated state injected by server into window.__INITIAL_STATE__
const dehydratedState = (window as Window & { __INITIAL_STATE__?: unknown }).__INITIAL_STATE__

// Create a QueryClient with the same config as the server so hydration matches
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

// hydrateRoot: React 18's SSR-aware mount that reconciles server HTML
// without re-rendering, giving us instant first paint
hydrateRoot(
  document.getElementById('root') as HTMLElement,
  <App queryClient={queryClient} dehydratedState={dehydratedState} />
)

// Register SW after hydration — never blocks the critical path
registerServiceWorker()
