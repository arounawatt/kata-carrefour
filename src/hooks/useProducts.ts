import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import type { FetchProductsParams } from '@/types'

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: FetchProductsParams) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
  categories: () => ['categories'] as const,
}

export function useProducts(params: FetchProductsParams = {}) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => api.getProducts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes — data stays fresh
    gcTime: 10 * 60 * 1000,   // 10 minutes — keep in cache
    placeholderData: (prev) => prev, // Keeps previous data while refetching (no flash)
  })
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => api.getProduct(id),
    staleTime: 5 * 60 * 1000,
    enabled: id > 0,
  })
}

export function useCategories() {
  return useQuery({
    queryKey: productKeys.categories(),
    queryFn: () => api.getCategories(),
    staleTime: 60 * 60 * 1000, // 1 hour — categories rarely change
  })
}
