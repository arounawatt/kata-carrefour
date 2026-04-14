# Arouna — Kata E-commerce

A frontend MVP for an e-commerce product gallery, built with React 18, TypeScript, and Vite SSR.

---

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production build

```bash
npm run build
npm run preview
```

Live demo: [https://kata-arouna-cfr.onrender.com/](https://kata-arouna-cfr.onrender.com/) (cold start ~30s on free tier)

---

## Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | React 18 | Concurrent features, `hydrateRoot`, Suspense |
| Language | TypeScript (strict) | Type safety across client + server |
| Bundler/SSR | Vite 5 + custom Express | Full SSR control without a meta-framework |
| Data fetching | TanStack Query v5 | Cache, dehydrate/hydrate, stale-while-revalidate |
| State (cart) | Zustand + persist middleware | Minimal boilerplate, localStorage persistence, SSR-safe |
| Routing | React Router v6 | Code-splitting, nested routes |
| Styling | CSS Modules | No class name collisions, styles co-located with components |
| API | DummyJSON | Product data (ratings, stock, discounts, categories) |
| Testing | Vitest + Testing Library | Native Vite integration, jsdom environment |

---

## Testing

```bash
npm test            # single run
npm run test:watch  # watch mode
```

Tests cover:
- **Unit** — `cartStore` business logic (addItem, removeItem, updateQuantity, stock caps, selectors)
- **Unit** — `api` service (URL construction, caching, error handling)
- **Component** — `ProductCard`, `CartItem`, `CartSidebar` (rendering, interactions, edge cases)

---

## Business Rules

| Rule | Implementation |
|---|---|
| Stock cap on add | `addItem` refuses to add if `cartQty >= product.stock` |
| Out-of-stock guard | Products with `stock === 0` cannot be added; button shows "Out of stock" |
| Max qty reached | When `cartQty >= stock`, ProductCard button shows "Max qty" and is disabled |
| Cart persistence | Items survive page reload via `localStorage` (Zustand persist middleware) |
| Quantity → 0 removes | Decrementing to 0 via `updateQuantity` removes the item entirely |
| Quantity cap | `updateQuantity` clamps to `product.stock` — can't over-order via direct call |
| Discounted price | Displayed as `price × (1 − discountPercentage / 100)`; original price and badge shown when discount > 5% |

---

## Architecture decisions & trade-offs

### Why SSR?
To demonstrate awareness of the full rendering pipeline (FCP, SEO, hydration). For a kata, this is over-engineered — a pure CSR Vite app would have been simpler. The trade-off is explicit: meaningful FCP and correct metadata, at the cost of a more complex server setup.

### Why TanStack Query instead of `useEffect` + `useState`?
`useEffect` data fetching duplicates loading/error/data state, is prone to race conditions on fast navigation, and has no deduplication. TanStack Query solves all three and adds stale-while-revalidate semantics so revisited pages feel instant.

### Why Zustand over Context + useReducer?
Context re-renders every consumer on every state change. For a cart that updates on every `addItem`, that repaints every component in the tree. Zustand's selector-based subscriptions mean only components that read the changed slice re-render.

### Why CSS Modules over Tailwind?
Both are valid. CSS Modules keep styles co-located with their component and readable without knowing Tailwind's class vocabulary — lower cognitive load when reviewing unfamiliar code.

### Known limitations

- Stock figures come from DummyJSON and are not decremented server-side; "Max qty" is enforced client-side only.
- No authentication; cart is anonymous and browser-local.
- Category filter is capped at 8 items to avoid overflow on small screens.

---

## Performance Strategy

### Critical Rendering Path

1. Server sends complete HTML → browser can paint immediately (no JS needed for first render)
2. Fonts are preconnected (`<link rel="preconnect">`) to eliminate DNS lookup latency
3. API is preconnected too, cutting ~100ms from the first data fetch
4. Images use `loading="lazy"` and `decoding="async"` — off-screen images don't block rendering
5. Skeleton screens prevent layout shift during navigation

### Metrics targets

| Metric | Strategy |
|---|---|
| FCP | SSR — full HTML on first byte |
| LCP | Preconnect to DummyJSON + image lazy loading |
| CLS | Fixed aspect-ratio image containers (no layout shift) |
| INP | Optimistic updates — UI responds in <16ms |
| TTFB | Node.js + Express — typically <50ms on local network |