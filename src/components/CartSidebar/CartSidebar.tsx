import { useEffect, useRef } from 'react'
import { useCartStore } from '@/stores/cartStore'
import { CartItem } from './CartItem'
import styles from './CartSidebar.module.css'

export function CartSidebar() {
  const isOpen = useCartStore((state) => state.isOpen)
  const closeCart = useCartStore((state) => state.closeCart)
  const items = useCartStore((state) => state.items)
  const clearCart = useCartStore((state) => state.clearCart)
  const getTotalPrice = useCartStore((state) => state.getTotalPrice)
  const getTotalItems = useCartStore((state) => state.getTotalItems)

  const overlayRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) closeCart()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, closeCart])

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Focus trap: focus sidebar when opened
  useEffect(() => {
    if (isOpen && sidebarRef.current) {
      sidebarRef.current.focus()
    }
  }, [isOpen])

  const totalPrice = getTotalPrice()
  const totalItems = getTotalItems()

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ''}`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}
        aria-label="Shopping cart"
        aria-modal="true"
        role="dialog"
        tabIndex={-1}
      >
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Cart</h2>
            {totalItems > 0 && (
              <p className={styles.subtitle}>{totalItems} item{totalItems !== 1 ? 's' : ''}</p>
            )}
          </div>
          <button
            className={styles.closeButton}
            onClick={closeCart}
            aria-label="Close cart"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {items.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>◇</span>
              <p className={styles.emptyText}>Your cart is empty</p>
              <p className={styles.emptySubtext}>Add some products to get started</p>
              <button className={styles.continueButton} onClick={closeCart}>
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className={styles.itemList} aria-label="Cart items">
              {items.map((item) => (
                <li key={item.product.id}>
                  <CartItem item={item} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.subtotal}>
              <span>Subtotal</span>
              <span className={styles.subtotalPrice}>${totalPrice.toFixed(2)}</span>
            </div>
            <p className={styles.shipping}>Shipping calculated at checkout</p>
            <button className={styles.checkoutButton}>
              Proceed to Checkout
              <ChevronIcon />
            </button>
            <button
              className={styles.clearButton}
              onClick={clearCart}
              aria-label="Clear all cart items"
            >
              Clear cart
            </button>
          </div>
        )}
      </aside>
    </>
  )
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}
