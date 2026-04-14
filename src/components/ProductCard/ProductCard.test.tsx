import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductCard } from './ProductCard'
import { useCartStore } from '@/stores/cartStore'
import type { Product } from '@/types'

const baseProduct: Product = {
  id: 42,
  title: 'Ultra Keyboard',
  price: 120,
  description: 'Mechanical keyboard',
  category: 'electronics',
  thumbnail: 'https://example.com/kb.jpg',
  images: [],
  rating: { rate: 4.7, count: 300 },
  stock: 15,
  brand: 'KeyCo',
  discountPercentage: 20,
}

beforeEach(() => {
  useCartStore.setState({ items: [], isOpen: false })
  localStorage.clear()
})

describe('ProductCard', () => {
  it('renders the product title', () => {
    render(<ProductCard product={baseProduct} />)
    expect(screen.getByText('Ultra Keyboard')).toBeInTheDocument()
  })

  it('renders the discounted price', () => {
    render(<ProductCard product={baseProduct} />)
    // 120 × (1 - 0.20) = 96.00
    expect(screen.getByText('$96.00')).toBeInTheDocument()
  })

  it('shows the original price when discount is above 5%', () => {
    render(<ProductCard product={baseProduct} />)
    expect(screen.getByText('$120.00')).toBeInTheDocument()
  })

  it('shows the discount badge when discount is above 5%', () => {
    render(<ProductCard product={baseProduct} />)
    expect(screen.getByText('-20%')).toBeInTheDocument()
  })

  it('does not show the discount badge when discount is 5% or below', () => {
    const noDiscount = { ...baseProduct, discountPercentage: 3 }
    render(<ProductCard product={noDiscount} />)
    expect(screen.queryByText(/-\d+%/)).not.toBeInTheDocument()
  })

  it('disables the button and shows "Out of stock" when stock is 0', () => {
    const outOfStock = { ...baseProduct, stock: 0 }
    render(<ProductCard product={outOfStock} />)
    const button = screen.getByRole('button', { name: /add ultra keyboard to cart/i })
    expect(button).toBeDisabled()
    expect(button).toHaveTextContent('Out of stock')
  })

  it('calls addItem on the cart store when the add button is clicked', async () => {
    const user = userEvent.setup()
    render(<ProductCard product={baseProduct} />)
    const button = screen.getByRole('button', { name: /add ultra keyboard to cart/i })
    await user.click(button)
    expect(useCartStore.getState().items).toHaveLength(1)
    expect(useCartStore.getState().items[0].product.id).toBe(42)
  })

  it('shows the quantity in cart badge when the product is already in cart', () => {
    useCartStore.getState().addItem(baseProduct)
    useCartStore.getState().addItem(baseProduct)
    render(<ProductCard product={baseProduct} />)
    expect(screen.getByLabelText('2 in cart')).toBeInTheDocument()
  })

  it('disables the button and shows "Max qty" when cart quantity equals stock', () => {
    // Fill cart to max stock (15)
    useCartStore.setState({
      items: [{ product: baseProduct, quantity: baseProduct.stock, addedAt: Date.now() }],
      isOpen: false,
    })
    render(<ProductCard product={baseProduct} />)
    const button = screen.getByRole('button', { name: /add ultra keyboard to cart/i })
    expect(button).toBeDisabled()
    expect(button).toHaveTextContent('Max qty')
  })
})
