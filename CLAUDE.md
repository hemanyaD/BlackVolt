# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

BlackVolt — marketing + e-commerce site for an Indian D2C liquid coffee
concentrate brand. Next.js App Router + TypeScript, Tailwind CSS **v4**, Framer
Motion. No backend: products/content are local TS files; the cart is client-side
(React context + `localStorage`).

## Commands

```bash
npm run dev      # dev server (Turbopack) at http://localhost:3000
npm run build    # production build — also runs the TypeScript type-check
npm start        # serve the production build
npx eslint .     # lint (there is no `next lint` in Next 16; use eslint directly)
```

There is no test suite. Treat a clean `npm run build` + `npx eslint .` as the
bar before considering work done — the build is the type-check.

## Next.js 16 gotchas (this is NOT the Next.js in your training data)

This project runs **Next.js 16** with breaking changes. Before writing routing,
metadata, or data code, consult the bundled docs in
`node_modules/next/dist/docs/` (see `AGENTS.md`). The ones that bite:

- **`params` and `searchParams` are Promises** in pages/layouts/`generateMetadata`.
  Always `await` them. Use the global helper types `PageProps<'/route'>` /
  `LayoutProps<'/route'>` (auto-generated; `npx next typegen` refreshes them).
- **Turbopack is the default** for dev and build.
- **`next lint` was removed.** The `lint` script calls `eslint` directly.
- React 19's `react-hooks/set-state-in-effect` is an **error**. Avoid `setState`
  in effects; the one justified exception (hydration-safe `localStorage` load in
  `CartContext`) carries an inline `eslint-disable` with a reason.

## Architecture

- **Theme is centralized.** Brand colors live as Tailwind v4 `@theme` tokens in
  `src/app/globals.css` (these generate `bg-charcoal`, `text-gold`, etc.). The
  same values are mirrored in `src/lib/theme.ts` for JS/SVG that can't read a CSS
  variable — **change both together.** Fonts are wired once in
  `src/app/layout.tsx` via `next/font` (`--font-display` = Archivo headings,
  `--font-inter` = Inter body).
- **Server components by default; client islands where needed.** Pages are
  server components (for metadata/SEO and SSG). Interactivity is isolated to
  `"use client"` components: `Navbar`, `CartContext`, `ProductCard`,
  `ProductPurchase`, `Reveal`, `Accordion`, `ContactForm`, `NewsletterForm`,
  `home/Hero`. Server pages render these as children — keep it that way.
- **Data layer is backend-swappable.** All product access goes through helpers in
  `src/data/products.ts` (`getAllProducts`, `getProductBySlug`,
  `getFeaturedProducts`). To move to a real API/CMS, make those async and update
  call sites — the `Product` shape (`src/types`) stays the contract.
- **Cart** is `src/context/CartContext.tsx`: `CartProvider` wraps the app in the
  root layout; components use `useCart()`. A cart line is keyed by **slug + mode**
  (`once` vs `subscribe`), so the same SKU can appear under both modes.
  Subscription pricing (10% off) is defined once as `SUBSCRIPTION_DISCOUNT`.
- **Layout shell:** `app/layout.tsx` mounts `CartProvider` → `Navbar` → `main` →
  `Footer` around every page. The `Navbar` is transparent only over the home
  hero (`pathname === "/"` and not scrolled) and solid everywhere else.
- **Visual rhythm** comes from the `Section` component's `tone` prop
  (`cream`/`bone`/`charcoal`); pages alternate light/dark sections deliberately.
- **Images are placeholders** (`ProductImage` renders colored panels, not real
  photos). Swap that component's body for `next/image` when assets exist.

## Conventions

- Imports use the `@/*` alias → `src/*`.
- Money is rendered via `formatINR` (from `src/data/products.ts`), never hardcoded.
- Reusable buttons: `Button` (real `<button>`) and `ButtonLink` (styled `Link`)
  from `src/components/Button.tsx`; don't hand-roll button styles.
