import { ProductCard } from '@/components/ProductCard/ProductCard'
import type { Product } from '@/types'
import styles from './ProductGrid.module.css'

interface ProductGridProps {
  products: Product[]
  isLoading?: boolean
  id?: string
}

const SKELETON_COUNT = 12

export function ProductGrid({ products, isLoading, id }: ProductGridProps) {
  if (isLoading) {
    return (
      <div id={id} className={styles.grid} aria-busy="true" aria-label="Loading products">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div id={id} className={styles.empty}>
        <span className={styles.emptyIcon}>◇</span>
        <p className={styles.emptyText}>No products found</p>
      </div>
    )
  }

  return (
    <div id={id} className={styles.grid} role="list">
      {products.map((product, index) => (
        <div key={product.id} role="listitem">
          <ProductCard
            product={product}
            style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
          />
        </div>
      ))}
    </div>
  )
}

function ProductCardSkeleton() {
  return (
    <div className={styles.skeleton} aria-hidden="true">
      <div className={styles.skeletonImage} />
      <div className={styles.skeletonContent}>
        <div className={`${styles.skeletonLine} ${styles.skeletonCategory}`} />
        <div className={`${styles.skeletonLine} ${styles.skeletonTitle}`} />
        <div className={`${styles.skeletonLine} ${styles.skeletonTitleShort}`} />
        <div className={styles.skeletonPriceRow}>
          <div className={`${styles.skeletonLine} ${styles.skeletonPrice}`} />
          <div className={styles.skeletonButton} />
        </div>
      </div>
    </div>
  )
}
