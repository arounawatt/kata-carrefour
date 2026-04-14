import { useCartStore } from './cartStore'
import type { Product } from '@/types'

const productA: Product = {
  id: 1,
  title: 'Widget Pro',
  price: 100,
  description: 'A great widget',
  category: 'electronics',
  thumbnail: 'https://example.com/a.jpg',
  images: [],
  rating: { rate: 4.5, count: 200 },
  stock: 10,
  brand: 'Acme',
  discountPercentage: 10,
}

const productB: Product = {
  id: 2,
  title: 'Gadget Basic',
  price: 50,
  description: 'A basic gadget',
  category: 'accessories',
  thumbnail: 'https://example.com/b.jpg',
  images: [],
  rating: { rate: 3.8, count: 80 },
  stock: 5,
  brand: 'Beta',
  discountPercentage: 0,
}

beforeEach(() => {
  useCartStore.setState({ items: [], isOpen: false })
  localStorage.clear()
})

describe('cartStore — initial state', () => {
  it('starts with an empty cart', () => {
    const { items } = useCartStore.getState()
    expect(items).toHaveLength(0)
  })

  it('starts with the sidebar closed', () => {
    const { isOpen } = useCartStore.getState()
    expect(isOpen).toBe(false)
  })
})

describe('cartStore — addItem', () => {
  it('adds a new product with quantity 1', () => {
    useCartStore.getState().addItem(productA)
    const { items } = useCartStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].product.id).toBe(productA.id)
    expect(items[0].quantity).toBe(1)
  })

  it('increments quantity when adding the same product twice', () => {
    useCartStore.getState().addItem(productA)
    useCartStore.getState().addItem(productA)
    const { items } = useCartStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(2)
  })

  it('keeps separate entries for different products', () => {
    useCartStore.getState().addItem(productA)
    useCartStore.getState().addItem(productB)
    const { items } = useCartStore.getState()
    expect(items).toHaveLength(2)
  })

  it('records addedAt timestamp on new items', () => {
    const before = Date.now()
    useCartStore.getState().addItem(productA)
    const after = Date.now()
    const { items } = useCartStore.getState()
    expect(items[0].addedAt).toBeGreaterThanOrEqual(before)
    expect(items[0].addedAt).toBeLessThanOrEqual(after)
  })

  it('does not add an out-of-stock product', () => {
    const outOfStock = { ...productA, stock: 0 }
    useCartStore.getState().addItem(outOfStock)
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('does not exceed available stock when adding repeatedly', () => {
    // productA has stock: 10; add 12 times
    for (let i = 0; i < 12; i++) useCartStore.getState().addItem(productA)
    expect(useCartStore.getState().items[0].quantity).toBe(productA.stock)
  })
})

describe('cartStore — removeItem', () => {
  it('removes the specified product', () => {
    useCartStore.getState().addItem(productA)
    useCartStore.getState().removeItem(productA.id)
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('does not affect other items when removing one', () => {
    useCartStore.getState().addItem(productA)
    useCartStore.getState().addItem(productB)
    useCartStore.getState().removeItem(productA.id)
    const { items } = useCartStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].product.id).toBe(productB.id)
  })
})

describe('cartStore — updateQuantity', () => {
  it('updates quantity to the given value', () => {
    useCartStore.getState().addItem(productA)
    useCartStore.getState().updateQuantity(productA.id, 5)
    expect(useCartStore.getState().items[0].quantity).toBe(5)
  })

  it('removes the item when quantity is set to 0', () => {
    useCartStore.getState().addItem(productA)
    useCartStore.getState().updateQuantity(productA.id, 0)
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('removes the item when quantity is negative', () => {
    useCartStore.getState().addItem(productA)
    useCartStore.getState().updateQuantity(productA.id, -1)
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('caps quantity at available stock', () => {
    useCartStore.getState().addItem(productA)
    // Try to set quantity beyond stock (productA.stock === 10)
    useCartStore.getState().updateQuantity(productA.id, 99)
    expect(useCartStore.getState().items[0].quantity).toBe(productA.stock)
  })
})

describe('cartStore — clearCart', () => {
  it('empties all items', () => {
    useCartStore.getState().addItem(productA)
    useCartStore.getState().addItem(productB)
    useCartStore.getState().clearCart()
    expect(useCartStore.getState().items).toHaveLength(0)
  })
})

describe('cartStore — selectors', () => {
  it('getTotalItems returns 0 for empty cart', () => {
    expect(useCartStore.getState().getTotalItems()).toBe(0)
  })

  it('getTotalItems sums all quantities', () => {
    useCartStore.getState().addItem(productA)
    useCartStore.getState().addItem(productA)
    useCartStore.getState().addItem(productB)
    expect(useCartStore.getState().getTotalItems()).toBe(3)
  })

  it('getTotalPrice returns 0 for empty cart', () => {
    expect(useCartStore.getState().getTotalPrice()).toBe(0)
  })

  it('getTotalPrice calculates sum of price × quantity for each item', () => {
    useCartStore.getState().addItem(productA) // price 100
    useCartStore.getState().addItem(productA) // qty 2 → 200
    useCartStore.getState().addItem(productB) // price 50, qty 1 → 50
    expect(useCartStore.getState().getTotalPrice()).toBe(250)
  })

  it('getItemQuantity returns 0 for a product not in cart', () => {
    expect(useCartStore.getState().getItemQuantity(productA.id)).toBe(0)
  })

  it('getItemQuantity returns the current quantity for a product in cart', () => {
    useCartStore.getState().addItem(productA)
    useCartStore.getState().addItem(productA)
    expect(useCartStore.getState().getItemQuantity(productA.id)).toBe(2)
  })
})

describe('cartStore — sidebar visibility', () => {
  it('openCart sets isOpen to true', () => {
    useCartStore.getState().openCart()
    expect(useCartStore.getState().isOpen).toBe(true)
  })

  it('closeCart sets isOpen to false', () => {
    useCartStore.getState().openCart()
    useCartStore.getState().closeCart()
    expect(useCartStore.getState().isOpen).toBe(false)
  })

  it('toggleCart flips isOpen', () => {
    expect(useCartStore.getState().isOpen).toBe(false)
    useCartStore.getState().toggleCart()
    expect(useCartStore.getState().isOpen).toBe(true)
    useCartStore.getState().toggleCart()
    expect(useCartStore.getState().isOpen).toBe(false)
  })
})
