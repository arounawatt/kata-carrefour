import { useState, useCallback } from 'react'
import type { Product } from '@/types'
import { useCartStore } from '@/stores/cartStore'
import styles from './ProductCard.module.css'

interface ProductCardProps {
  product: Product
  style?: React.CSSProperties
}

export function ProductCard({ product, style }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  const addItem = useCartStore((state) => state.addItem)
  const getItemQuantity = useCartStore((state) => state.getItemQuantity)
  const quantity = getItemQuantity(product.id)

  const discountedPrice = product.price * (1 - product.discountPercentage / 100)
  const isAtMaxStock = product.stock > 0 && quantity >= product.stock

  const handleAddToCart = useCallback(async () => {
    setIsAdding(true)
    // Optimistic update — immediate UI feedback
    addItem(product)

    // Simulate brief animation window
    await new Promise((resolve) => setTimeout(resolve, 600))
    setIsAdding(false)
  }, [addItem, product])

  const ratingStars = Math.round(product.rating.rate)

  return (
    <article className={styles.card} style={style} aria-label={product.title}>
      {/* Image */}
      <div className={styles.imageWrapper}>
        {!imageLoaded && <div className={styles.imageSkeleton} />}
        <img
          src={product.thumbnail}
          alt={product.title}
          className={`${styles.image} ${imageLoaded ? styles.imageVisible : ''}`}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
          decoding="async"
        />
        {product.discountPercentage > 5 && (
          <span className={styles.discountBadge}>
            -{Math.round(product.discountPercentage)}%
          </span>
        )}
        {quantity > 0 && (
          <span className={styles.inCartBadge} aria-label={`${quantity} in cart`}>
            {quantity} in cart
          </span>
        )}
      </div>

      {/* Content */}
      <div className={styles.content}>
        <p className={styles.category}>{product.category}</p>
        <h2 className={styles.title}>{product.title}</h2>

        {/* Rating */}
        <div className={styles.rating} aria-label={`Rating: ${product.rating.rate} out of 5`}>
          <div className={styles.stars} aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`${styles.star} ${i < ratingStars ? styles.starFilled : ''}`}
              >
                ★
              </span>
            ))}
          </div>
          <span className={styles.ratingCount}>({product.rating.count})</span>
        </div>

        {/* Price row */}
        <div className={styles.priceRow}>
          <div className={styles.prices}>
            <span className={styles.price}>${discountedPrice.toFixed(2)}</span>
            {product.discountPercentage > 5 && (
              <span className={styles.originalPrice}>${product.price.toFixed(2)}</span>
            )}
          </div>

          <button
            className={`${styles.addButton} ${isAdding ? styles.adding : ''}`}
            onClick={handleAddToCart}
            disabled={isAdding || product.stock === 0 || isAtMaxStock}
            aria-label={`Add ${product.title} to cart`}
          >
            {isAdding ? (
              <span className={styles.checkmark}>✓</span>
            ) : product.stock === 0 ? (
              'Out of stock'
            ) : isAtMaxStock ? (
              'Max qty'
            ) : (
              <AddIcon />
            )}
          </button>
        </div>
      </div>
    </article>
  )
}

function AddIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}
