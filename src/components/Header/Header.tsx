import { useCartStore } from '@/stores/cartStore'
import styles from './Header.module.css'

export function Header() {
  const totalItems = useCartStore((state) => state.getTotalItems())
  const toggleCart = useCartStore((state) => state.toggleCart)

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <a href="/" className={styles.logo}>
          <span className={styles.logoText}>My Kata</span>
        </a>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            className={styles.cartButton}
            onClick={toggleCart}
            aria-label={`Open cart, ${totalItems} items`}
          >
            <CartIcon />
            {totalItems > 0 && (
              <span className={styles.badge} aria-hidden="true">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  )
}
