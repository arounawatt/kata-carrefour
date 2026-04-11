// ─── Product ──────────────────────────────────────────────────────────────────

export interface ProductRating {
  rate: number
  count: number
}

export interface Product {
  id: number
  title: string
  price: number
  description: string
  category: string
  thumbnail: string
  images: string[]
  rating: ProductRating
  stock: number
  brand: string
  discountPercentage: number
}

export interface ProductsResponse {
  products: Product[]
  total: number
  skip: number
  limit: number
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  product: Product
  quantity: number
  addedAt: number
}

export interface CartState {
  items: CartItem[]
  isOpen: boolean
  // Actions
  addItem: (product: Product) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  // Selectors
  getTotalItems: () => number
  getTotalPrice: () => number
  getItemQuantity: (productId: number) => number
}

// ─── API ──────────────────────────────────────────────────────────────────────

export interface FetchProductsParams {
  limit?: number
  skip?: number
  category?: string
  search?: string
}

// ─── SSR ──────────────────────────────────────────────────────────────────────

export interface SSRContext {
  url: string
  isSSR: boolean
}

export interface DehydratedState {
  queries: unknown[]
}
