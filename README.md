# Arouna — Kata E-commerce Skiils

A production-grade frontend MVP for an e-commerce product gallery, built with React 18, TypeScript, and Vite SSR.

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

For PRODUCTION, open [https://kata-arouna-cfr.onrender.com/](https://kata-arouna-cfr.onrender.com/) and wait the server turn on and it start application.

---

## Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | React 18 | Concurrent features, `hydrateRoot`, Suspense |
| Language | TypeScript (strict) | Type safety across client + server |
| Bundler/SSR | Vite 5 + custom Express | Full SSR control without a meta-framework|
| Data fetching | TanStack Query v5 (old react-query) | Cache, dehydrate/hydrate, stale-while-revalidate for network request |
| State (cart) | Zustand + persist middleware | Minimal boilerplate, localStorage persistence, SSR-safe |
| Routing | React Router v6 | Code-splitting, nested routes |
| Styling | CSS Modules | no class name collisions |
| API | DummyJSON | Product data (ratings, stock, discounts, categories) |


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

---