import { useState, useCallback, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProducts, useCategories } from '@/hooks/useProducts'
import { ProductGrid } from '@/components/ProductGrid/ProductGrid'
import styles from './ProductListPage.module.css'

const PRODUCTS_PER_PAGE = 20

export function ProductListPage() {
  // ─── URL state sync ─────────────────────────────────────────────────────────
  // All filter state lives in the URL so users can share/bookmark filtered views
  // and the browser back button works correctly.
  const [searchParams, setSearchParams] = useSearchParams()

  const selectedCategory = searchParams.get('category') ?? ''
  const debouncedSearch = searchParams.get('q') ?? ''
  const currentPage = parseInt(searchParams.get('page') ?? '1', 10)
  const skip = (currentPage - 1) * PRODUCTS_PER_PAGE

  // Local search input value (not debounced — updates on every keystroke)
  const [search, setSearch] = useState(debouncedSearch)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep local search in sync if URL changes externally (e.g. back button)
  useEffect(() => {
    setSearch(searchParams.get('q') ?? '')
  }, [searchParams])

  const { data: categoriesData } = useCategories()

  const { data, isLoading, isFetching, isError } = useProducts({
    limit: PRODUCTS_PER_PAGE,
    skip,
    category: selectedCategory || undefined,
    search: debouncedSearch || undefined,
  })

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        for (const [key, value] of Object.entries(updates)) {
          if (value === null || value === '') {
            next.delete(key)
          } else {
            next.set(key, value)
          }
        }
        return next
      }, { replace: true }) // replace: true avoids polluting browser history on every keystroke
    },
    [setSearchParams]
  )

  const handleCategoryChange = useCallback(
    (category: string) => {
      setSearch('')
      updateParams({ category: category || null, q: null, page: null })
    },
    [updateParams]
  )

  // Debounced search — local state updates instantly, URL updates after 350ms
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        updateParams({ q: value || null, page: null, category: null })
      }, 350)
    },
    [updateParams]
  )

  const handlePageChange = useCallback(
    (page: number) => {
      updateParams({ page: page > 1 ? String(page) : null })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [updateParams]
  )

  const totalPages = data ? Math.ceil(data.total / PRODUCTS_PER_PAGE) : 0

  return (
    <main className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <p className={styles.heroEyebrow}>New Collection</p>
          <h1 className={styles.heroTitle}>
            Gallery for<br />
            <em>my Kata</em>
          </h1>
          <p className={styles.heroSubtitle}>
            {data ? `${data.total.toLocaleString()} products` : '—'}
          </p>
        </div>
      </section>

      <div className="container">
        {/* Toolbar */}
        <div className={styles.toolbar}>
          {/* Search */}
          <div className={styles.searchWrapper}>
            <SearchIcon />
            <input
              type="search"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search products…"
              className={styles.searchInput}
              aria-label="Search products"
              aria-controls="product-grid"
            />
            {isFetching && !isLoading && (
              <span className={styles.searchSpinner} aria-hidden="true" />
            )}
          </div>

          {/* Category filters */}
          <div
            className={styles.categories}
            role="group"
            aria-label="Filter by category"
          >
            <button
              className={`${styles.categoryChip} ${!selectedCategory ? styles.categoryChipActive : ''}`}
              onClick={() => handleCategoryChange('')}
              aria-pressed={!selectedCategory}
            >
              All
            </button>
            {categoriesData?.slice(0, 8).map((cat) => (
              <button
                key={cat}
                className={`${styles.categoryChip} ${selectedCategory === cat ? styles.categoryChipActive : ''}`}
                onClick={() => handleCategoryChange(cat)}
                aria-pressed={selectedCategory === cat}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Active filters summary (screen reader + visual) */}
        {(debouncedSearch || selectedCategory) && (
          <p className={styles.activeFilters} aria-live="polite">
            {debouncedSearch && (
              <span>Results for <strong>"{debouncedSearch}"</strong></span>
            )}
            {selectedCategory && (
              <span> in <strong>{selectedCategory}</strong></span>
            )}
            {data && <span> — {data.total} found</span>}
            <button
              className={styles.clearFilters}
              onClick={() => {
                setSearch('')
                setSearchParams({})
              }}
            >
              Clear filters ×
            </button>
          </p>
        )}

        {/* Error state */}
        {isError && (
          <div className={styles.error} role="alert">
            <p>Failed to load products. Please try again.</p>
            <button
              className={styles.retryButton}
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        )}

        {/* Grid */}
        <ProductGrid
          id="product-grid"
          products={data?.products ?? []}
          isLoading={isLoading}
        />

        {/* Pagination */}
        {totalPages > 1 && !isLoading && (
          <nav className={styles.pagination} aria-label="Pagination">
            <button
              className={styles.pageButton}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              ← Prev
            </button>

            <div className={styles.pageNumbers}>
              {getPaginationRange(currentPage, totalPages).map((page, i) =>
                page === '...' ? (
                  <span key={`ellipsis-${i}`} className={styles.ellipsis}>…</span>
                ) : (
                  <button
                    key={page}
                    className={`${styles.pageNumber} ${currentPage === page ? styles.pageNumberActive : ''}`}
                    onClick={() => handlePageChange(page as number)}
                    aria-label={`Page ${page}`}
                    aria-current={currentPage === page ? 'page' : undefined}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            <button
              className={styles.pageButton}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              Next →
            </button>
          </nav>
        )}
      </div>
    </main>
  )
}

/** Generates pagination range with ellipsis, e.g. [1, '...', 4, 5, 6, '...', 12] */
function getPaginationRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const range: (number | '...')[] = [1]
  if (current > 3) range.push('...')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) range.push(i)

  if (current < total - 2) range.push('...')
  range.push(total)

  return range
}

function SearchIcon() {
  return (
    <svg
      className={styles.searchIcon}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}
