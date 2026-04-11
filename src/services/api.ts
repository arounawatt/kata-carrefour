import type { Product, ProductsResponse, FetchProductsParams } from '@/types'

const BASE_URL = 'https://dummyjson.com'

// Simple in-memory cache for SSR and client-side deduplication
const cache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key)
    return null
  }
  return entry.data as T
}

function setCached<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() })
}

async function fetchWithCache<T>(url: string, cacheKey: string): Promise<T> {
  const cached = getCached<T>(cacheKey)
  if (cached) return cached

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }

  const data: T = await response.json()
  setCached(cacheKey, data)
  return data
}

export const api = {
  getProducts: async (params: FetchProductsParams = {}): Promise<ProductsResponse> => {
    const { limit = 20, skip = 0, category, search } = params

    let url: string
    let cacheKey: string

    if (search) {
      url = `${BASE_URL}/products/search?q=${encodeURIComponent(search)}&limit=${limit}&skip=${skip}`
      cacheKey = `search:${search}:${limit}:${skip}`
    } else if (category) {
      url = `${BASE_URL}/products/category/${encodeURIComponent(category)}?limit=${limit}&skip=${skip}`
      cacheKey = `category:${category}:${limit}:${skip}`
    } else {
      url = `${BASE_URL}/products?limit=${limit}&skip=${skip}`
      cacheKey = `products:${limit}:${skip}`
    }

    return fetchWithCache<ProductsResponse>(url, cacheKey)
  },

  getProduct: async (id: number): Promise<Product> => {
    return fetchWithCache<Product>(
      `${BASE_URL}/products/${id}`,
      `product:${id}`
    )
  },

  getCategories: async (): Promise<string[]> => {
    return fetchWithCache<string[]>(
      `${BASE_URL}/products/category-list`,
      'categories'
    )
  },
}
