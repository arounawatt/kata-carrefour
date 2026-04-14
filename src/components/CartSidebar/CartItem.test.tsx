import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CartItem } from './CartItem'
import { useCartStore } from '@/stores/cartStore'
import type { CartItem as CartItemType, Product } from '@/types'

const product: Product = {
  id: 7,
  title: 'Noise-cancelling Headphones',
  price: 200,
  description: 'Great sound',
  category: 'audio',
  thumbnail: 'https://example.com/hp.jpg',
  images: [],
  rating: { rate: 4.9, count: 500 },
  stock: 3,
  brand: 'SoundCo',
  discountPercentage: 0,
}

const cartItem: CartItemType = {
  product,
  quantity: 2,
  addedAt: Date.now(),
}

beforeEach(() => {
  useCartStore.setState({ items: [cartItem], isOpen: true })
  localStorage.clear()
})

describe('CartItem', () => {
  it('renders the product title and category', () => {
    render(<CartItem item={cartItem} />)
    expect(screen.getByText('Noise-cancelling Headphones')).toBeInTheDocument()
    expect(screen.getByText('audio')).toBeInTheDocument()
  })

  it('renders the current quantity', () => {
    render(<CartItem item={cartItem} />)
    expect(screen.getByLabelText('Quantity: 2')).toBeInTheDocument()
  })

  it('renders the line total (price × quantity)', () => {
    render(<CartItem item={cartItem} />)
    // 200 × 2 = 400.00
    expect(screen.getByText('$400.00')).toBeInTheDocument()
  })

  it('removes the item when the remove button is clicked', async () => {
    const user = userEvent.setup()
    render(<CartItem item={cartItem} />)
    await user.click(
      screen.getByRole('button', { name: /remove noise-cancelling headphones from cart/i })
    )
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('disables the increase button when quantity equals stock', () => {
    const atStock: CartItemType = { ...cartItem, quantity: product.stock }
    render(<CartItem item={atStock} />)
    expect(screen.getByRole('button', { name: /increase quantity/i })).toBeDisabled()
  })

  it('updates quantity when decrease button is clicked', async () => {
    const user = userEvent.setup()
    render(<CartItem item={cartItem} />)
    await user.click(screen.getByRole('button', { name: /decrease quantity/i }))
    // quantity goes from 2 → 1
    expect(useCartStore.getState().items[0].quantity).toBe(1)
  })
})
