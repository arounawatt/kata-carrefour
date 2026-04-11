import { renderToString } from 'react-dom/server'
import { QueryClient, dehydrate } from '@tanstack/react-query'
import { App } from './App'
import { api } from './services/api'
import { productKeys } from './hooks/useProducts'

export async function render(url: string) {
  // Create a fresh QueryClient per request to avoid shared state between requests
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: false, // Don't retry on server — fail fast
      },
    },
  })

  // Prefetch initial products so the first HTML already has data embedded.
  // This is the key SSR benefit: zero waterfall for the first page load.
  try {
    await queryClient.prefetchQuery({
      queryKey: productKeys.list({ limit: 20, skip: 0 }),
      queryFn: () => api.getProducts({ limit: 20, skip: 0 }),
    })

    await queryClient.prefetchQuery({
      queryKey: productKeys.categories(),
      queryFn: () => api.getCategories(),
    })
  } catch (err) {
    // Prefetch failure is non-fatal: client will fetch on hydration
    console.error('[SSR] Prefetch failed:', err)
  }

  // Dehydrate the cache so it can be serialized into the HTML
  const dehydratedState = dehydrate(queryClient)

  // Render the app tree to an HTML string
  const html = renderToString(
    <App queryClient={queryClient} dehydratedState={dehydratedState} url={url} isSSR={true} />
  )

  queryClient.clear()

  return { html, dehydratedState }
}