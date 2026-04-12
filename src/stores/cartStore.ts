import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartState, CartItem, Product } from '@/types'

// Safe storage that handles SSR (no window/localStorage on server)
const safeStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null
    try {
      return localStorage.getItem(name)
    } catch {
      return null
    }
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(name, value)
    } catch {
      // Storage might be full or blocked
      console.warn('Cart persistence failed: localStorage unavailable')
    }
  },
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(name)
    } catch {
      // Silently fail
    }
  },
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      // ─── Mutations ───────────────────────────────────────────────────────────

      addItem: (product: Product) => {
        // Optimistic update: immediately update UI, no async needed here
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.product.id === product.id
          )

          if (existingIndex >= 0) {
            // Item exists: increment quantity
            const updatedItems = [...state.items]
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: updatedItems[existingIndex].quantity + 1,
            }
            return { items: updatedItems }
          }

          // New item: append to cart
          const newItem: CartItem = {
            product,
            quantity: 1,
            addedAt: Date.now(),
          }
          return { items: [...state.items, newItem] }
        })
      },

      removeItem: (productId: number) => {
        // Capture previous state for potential rollback
        const previousItems = get().items

        // Optimistic update
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }))

        // In a real app with a backend cart API, you'd call the API here
        // and rollback on failure:
        // try {
        //   await cartApi.removeItem(productId)
        // } catch (error) {
        //   set({ items: previousItems }) // rollback
        //   toast.error('Failed to remove item')
        // }

        // Suppress unused variable warning in this demo
        void previousItems
      },

      updateQuantity: (productId: number, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      // ─── Sidebar visibility ──────────────────────────────────────────────────

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      // ─── Derived selectors ───────────────────────────────────────────────────

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        )
      },

      getItemQuantity: (productId: number) => {
        const item = get().items.find((i) => i.product.id === productId)
        return item?.quantity ?? 0
      },
    }),
    {
      name: 'eshop-cart',
      storage: createJSONStorage(() => safeStorage),
      // Only persist items, not UI state like isOpen
      partialize: (state) => ({ items: state.items }),
    }
  )
)
