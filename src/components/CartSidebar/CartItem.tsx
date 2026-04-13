import type { CartItem as CartItemType } from '@/types'
import { useCartStore } from '@/stores/cartStore'
import styles from './CartItem.module.css'

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)

  const { product, quantity } = item
  const discountedPrice = product.price * (1 - product.discountPercentage / 100)
  const lineTotal = discountedPrice * quantity

  return (
    <div className={styles.item}>
      {/* Image */}
      <div className={styles.imageWrapper}>
        <img
          src={product.thumbnail}
          alt={product.title}
          className={styles.image}
          loading="lazy"
        />
      </div>

      {/* Details */}
      <div className={styles.details}>
        <p className={styles.category}>{product.category}</p>
        <p className={styles.title}>{product.title}</p>
        <p className={styles.price}>${discountedPrice.toFixed(2)}</p>

        <div className={styles.actions}>
          {/* Quantity controls */}
          <div className={styles.quantityControl} role="group" aria-label="Quantity">
            <button
              className={styles.qtyButton}
              onClick={() => updateQuantity(product.id, quantity - 1)}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className={styles.qtyValue} aria-label={`Quantity: ${quantity}`}>
              {quantity}
            </span>
            <button
              className={styles.qtyButton}
              onClick={() => updateQuantity(product.id, quantity + 1)}
              disabled={quantity >= product.stock}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Line total */}
          <span className={styles.lineTotal}>${lineTotal.toFixed(2)}</span>

          {/* Remove */}
          <button
            className={styles.removeButton}
            onClick={() => removeItem(product.id)}
            aria-label={`Remove ${product.title} from cart`}
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </div>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  )
}
