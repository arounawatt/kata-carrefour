import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider, HydrationBoundary } from '@tanstack/react-query'
import { Header } from '@/components/Header/Header'
import { CartSidebar } from '@/components/CartSidebar/CartSidebar'
import { ProductListPage } from '@/pages/ProductListPage'
import { ErrorBoundary } from '@/components/UI/ErrorBoundary'

interface AppProps {
  queryClient: QueryClient
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dehydratedState?: any
  url?: string       // provided on server, undefined on client
  isSSR?: boolean
}

export function App({ queryClient, dehydratedState, url = '/', isSSR = false }: AppProps) {
  const routes = (
    <Routes>
      <Route
        path="/"
        element={
          <ErrorBoundary>
            <ProductListPage />
          </ErrorBoundary>
        }
      />
    </Routes>
  )

  const content = (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <ErrorBoundary>
          <Header />
          <CartSidebar />
          {routes}
        </ErrorBoundary>
      </HydrationBoundary>
    </QueryClientProvider>
  )

  // StaticRouter for SSR (no document/window), BrowserRouter for client
  if (isSSR) {
    return <MemoryRouter initialEntries={[url]}>{content}</MemoryRouter>
  }

  return <BrowserRouter>{content}</BrowserRouter>
}