import { vi } from 'vitest'
import type { ProductsResponse } from '@/types'

// Mock fetch globally before importing the module so the module picks it up
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function okResponse(data: unknown) {
  return Promise.resolve({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: () => Promise.resolve(data),
  } as Response)
}

const sampleProducts: ProductsResponse = {
  products: [
    {
      id: 10,
      title: 'Test Product',
      price: 29.99,
      description: 'desc',
      category: 'electronics',
      thumbnail: 'https://example.com/img.jpg',
      images: [],
      rating: { rate: 4, count: 50 },
      stock: 20,
      brand: 'TestBrand',
      discountPercentage: 5,
    },
  ],
  total: 1,
  skip: 0,
  limit: 20,
}

// Each test uses a unique skip value to bypass the module-level cache
let skipCounter = 1000

beforeEach(() => {
  mockFetch.mockClear()
  skipCounter += 100
})

describe('api.getProducts', () => {
  it('fetches products from the base URL', async () => {
    mockFetch.mockReturnValueOnce(okResponse(sampleProducts))
    // Use dynamic import to get a fresh module reference; rely on unique skip to bust cache
    const { api } = await import('./api')
    const skip = skipCounter
    await api.getProducts({ skip })
    expect(mockFetch).toHaveBeenCalledOnce()
    expect(mockFetch.mock.calls[0][0]).toContain(`skip=${skip}`)
    expect(mockFetch.mock.calls[0][0]).toContain('dummyjson.com/products')
  })

  it('builds the correct search URL when search param is provided', async () => {
    mockFetch.mockReturnValueOnce(okResponse(sampleProducts))
    const { api } = await import('./api')
    await api.getProducts({ search: 'keyboard', skip: skipCounter })
    expect(mockFetch.mock.calls[0][0]).toContain('/products/search')
    expect(mockFetch.mock.calls[0][0]).toContain('q=keyboard')
  })

  it('builds the correct category URL when category param is provided', async () => {
    mockFetch.mockReturnValueOnce(okResponse(sampleProducts))
    const { api } = await import('./api')
    await api.getProducts({ category: 'smartphones', skip: skipCounter })
    expect(mockFetch.mock.calls[0][0]).toContain('/products/category/smartphones')
  })

  it('returns the parsed JSON data', async () => {
    mockFetch.mockReturnValueOnce(okResponse(sampleProducts))
    const { api } = await import('./api')
    const result = await api.getProducts({ skip: skipCounter })
    expect(result.products).toHaveLength(1)
    expect(result.total).toBe(1)
  })

  it('throws an error when the API responds with a non-OK status', async () => {
    mockFetch.mockReturnValueOnce(
      Promise.resolve({ ok: false, status: 500, statusText: 'Internal Server Error' } as Response)
    )
    const { api } = await import('./api')
    await expect(api.getProducts({ skip: skipCounter })).rejects.toThrow('API error')
  })

  it('returns cached data on the second call without re-fetching', async () => {
    mockFetch.mockReturnValue(okResponse(sampleProducts))
    const { api } = await import('./api')
    const fixedSkip = 9999
    await api.getProducts({ skip: fixedSkip })
    await api.getProducts({ skip: fixedSkip })
    // fetch should have been called only once due to cache
    expect(mockFetch).toHaveBeenCalledOnce()
  })
})
