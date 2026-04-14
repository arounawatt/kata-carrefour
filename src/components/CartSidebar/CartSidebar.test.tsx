import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CartSidebar } from './CartSidebar'
import { useCartStore } from '@/stores/cartStore'
import type { Product } from '@/types'

const product: Product = {
  id: 3,
  title: 'Ergonomic Chair',
  price: 350,
  description: 'Good posture',
  category: 'furniture',
  thumbnail: 'https://example.com/chair.jpg',
  images: [],
  rating: { rate: 4.6, count: 120 },
  stock: 8,
  brand: 'ChairMaker',
  discountPercentage: 0,
}

beforeEach(() => {
  useCartStore.setState({ items: [], isOpen: false })
  localStorage.clear()
})

describe('CartSidebar', () => {
  it('shows the empty-cart message when no items are in the cart', () => {
    useCartStore.setState({ isOpen: true })
    render(<CartSidebar />)
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
  })

  it('lists cart items when the cart has products', () => {
    useCartStore.setState({
      items: [{ product, quantity: 1, addedAt: Date.now() }],
      isOpen: true,
    })
    render(<CartSidebar />)
    expect(screen.getByText('Ergonomic Chair')).toBeInTheDocument()
  })

  it('displays the subtotal price in the footer', () => {
    useCartStore.setState({
      items: [{ product, quantity: 2, addedAt: Date.now() }],
      isOpen: true,
    })
    render(<CartSidebar />)
    // 350 × 2 = 700.00 — assert via the "Subtotal" row
    const subtotalRow = screen.getByText('Subtotal').closest('div')
    expect(subtotalRow).toHaveTextContent('$700.00')
  })

  it('shows the item count in the header', () => {
    useCartStore.setState({
      items: [{ product, quantity: 3, addedAt: Date.now() }],
      isOpen: true,
    })
    render(<CartSidebar />)
    expect(screen.getByText('3 items')).toBeInTheDocument()
  })

  it('closes the cart when the close button is clicked', async () => {
    const user = userEvent.setup()
    useCartStore.setState({ isOpen: true })
    render(<CartSidebar />)
    await user.click(screen.getByRole('button', { name: /close cart/i }))
    expect(useCartStore.getState().isOpen).toBe(false)
  })

  it('clears all items when the clear cart button is clicked', async () => {
    const user = userEvent.setup()
    useCartStore.setState({
      items: [{ product, quantity: 1, addedAt: Date.now() }],
      isOpen: true,
    })
    render(<CartSidebar />)
    await user.click(screen.getByRole('button', { name: /clear all cart items/i }))
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('closes the cart when the Escape key is pressed', async () => {
    const user = userEvent.setup()
    useCartStore.setState({ isOpen: true })
    render(<CartSidebar />)
    await user.keyboard('{Escape}')
    expect(useCartStore.getState().isOpen).toBe(false)
  })
})
