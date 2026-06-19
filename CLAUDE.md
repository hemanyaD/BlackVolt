# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

BlackVolt — marketing + e-commerce site for an Indian D2C liquid coffee
concentrate brand. Next.js App Router + TypeScript, Tailwind CSS **v4**, Framer
Motion, and React Three Fiber (WebGL). The storefront content is static (products
are a local TS seed; the cart is client-side React context + `localStorage`), but
there is now a **small SQLite backend** for orders, logistics and inventory behind
a demo admin (see "Admin backend" below). The site leans hard on motion design —
scroll-driven scenes, marquees, a session preloader, and a procedural 3D bottle.
Requires **Node.js 20.9+**.

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
  server components (for metadata/SEO and SSG). All interactivity and animation
  lives in `"use client"` components (most of `src/components/` — navbar, cart,
  forms, and the whole motion layer below). Server pages render these as
  children — keep it that way; don't add `"use client"` to a route/page file.
- **Data layer is backend-swappable.** All product access goes through helpers in
  `src/data/products.ts` (`getAllProducts`, `getProductBySlug`,
  `getFeaturedProducts`). To move to a real API/CMS, make those async and update
  call sites — the `Product` shape (`src/types`) stays the contract.
- **Admin backend (orders / inventory / logistics).** A SQLite database
  (`better-sqlite3`) persists orders and stock. `src/lib/db.ts` is the single
  **server-only** data-access module (schema, seed-from-catalog, and all
  queries) — import it **only** from API route handlers, never a client
  component; the connection is cached on `globalThis` for dev HMR. The DB file is
  `data/blackvolt.db` (gitignored, created at runtime, inventory seeded from the
  product catalog on first run). `better-sqlite3` is native, so it's listed in
  `serverExternalPackages` (next.config.ts) and the routes pin
  `runtime = "nodejs"`. Routes: `POST /api/orders` is **public** (checkout —
  validates items against the catalog and decrements stock in one transaction);
  `GET /api/orders`, `PATCH /api/orders/[id]` (logistics; status→"cancelled"
  returns items to stock), `DELETE /api/orders/[id]`, `GET /api/inventory`,
  `PATCH /api/inventory/[slug]` are admin-only. The cart page's checkout step
  (`src/app/cart/page.tsx`) POSTs the real order. Order/inventory types live in
  `src/types`.
- **Shipping policy lives once** in `src/lib/shipping.ts` (`shippingFor()` — flat
  fee under a free-shipping threshold). Both the cart summary and `createOrder`
  call it, so the displayed total always matches what's persisted; the server
  recomputes shipping authoritatively (never trusts a client-sent total).
- **Customer accounts are REAL auth** (unlike the admin gate). Users live in the
  `users` table with scrypt-hashed passwords (`node:crypto`, no deps). Login/signup
  issue an opaque session token stored in the `sessions` table and an **httpOnly
  cookie** (`blackvolt_session`); `src/lib/auth.ts` `currentUser()` resolves the
  signed-in user server-side. Auth routes: `POST /api/auth/{signup,login,logout}`,
  `GET /api/auth/me`; account routes `GET /api/my-orders`, `PATCH /api/me`
  (profile + saved shipping address). Client state is `src/context/UserContext.tsx`
  (`useUser()`), provided in the root layout above `CartProvider`. Pages: `/login`,
  `/signup` (both honor `?next=`), `/account` (profile/address editor + order
  history). **Checkout now requires login** — `POST /api/orders` rejects anonymous
  requests (401) and stamps `order.user_id`; the cart redirects to
  `/login?next=/cart` and prefills the form from the saved address. Customers can
  **self-cancel their own order** within a window via
  `POST /api/my-orders/[id]/cancel` (restocks). The policy lives in
  `src/lib/orders.ts` (`ORDER_CANCEL_WINDOW_MS` = 1h, allowed only while
  `received`/`packed`) and is shared by the route's authorization and the
  `/account` cancel button/countdown. Admins can still cancel any order anytime.
- **Admin auth is a DEMO password gate — not real security.** One shared password
  (`ADMIN_PASSWORD` in `src/lib/admin.ts`) is checked client-side; it ships in the
  bundle. `src/lib/admin-client.ts` stores it in `localStorage` and replays it as
  the `x-admin-password` header, which `isAdminRequest()` checks on the server.
  `/admin/login` gates `/admin` (the one-page dashboard: stats, orders + logistics
  controls, editable inventory). The `SiteChrome` client wrapper hides the
  marketing navbar/footer on `/admin*`. For real auth, swap to a server-side
  credential check + httpOnly cookie.
- **Cart** is `src/context/CartContext.tsx`: `CartProvider` wraps the app in the
  root layout; components use `useCart()`. A cart line is keyed by **slug + mode**
  (`once` vs `subscribe`), so the same SKU can appear under both modes.
  Subscription pricing (10% off) is defined once as `SUBSCRIPTION_DISCOUNT`.
- **Layout shell:** `app/layout.tsx` mounts `CartProvider` → `Navbar` → `main` →
  `Footer` around every page. The `Navbar` is transparent only over the home
  hero (`pathname === "/"` and not scrolled) and solid everywhere else.
- **Visual rhythm** comes from the `Section` component's `tone` prop
  (`cream`/`bone`/`charcoal`); pages alternate light/dark sections deliberately.
- **Motion layer.** A large set of decorative Framer Motion client components
  drives the feel: scroll-pinned scenes (`BrewStory` — a `h-[320vh]` section with
  a `sticky` stage scrubbed by `useScroll`), `Marquee`/`MarqueeWall`, `Magnetic`
  buttons, `BeanCursor`, `Preloader`, `PageWipe`/`MaskReveal`/`Reveal`,
  `WaveDivider`, `Counter`. **Convention: every animated component must honor
  `useReducedMotion()`** and degrade to a static (or skipped) state — follow the
  existing components when adding one. The `Preloader` plays once per session via
  `sessionStorage` (`blackvolt:intro-played`); its client-only state decision
  carries the inline `react-hooks/set-state-in-effect` disable.
- **3D bottle (WebGL).** `Bottle3D` is a React Three Fiber `<Canvas>` built from
  procedural primitives with PBR materials and an **in-scene `Environment` of
  `Lightformer`s** for reflections (no network HDRI, no model asset). WebGL needs
  the browser, so it is **never imported directly** — always go through
  `Bottle3DView`, which `dynamic(..., { ssr: false })`-wraps it with a sized
  loading fallback. Any new R3F scene must follow the same `ssr: false` pattern.
- **SVG art reads brand colors from JS.** Hand-drawn SVG scenes (`SteamingCup`,
  `BrewStory`, `Preloader`, etc.) import `colors`/`brand` from `src/lib/theme.ts`
  rather than CSS classes — another reason the `globals.css` ↔ `theme.ts` mirror
  must stay in sync.
- **Hero is a full-bleed background video.** `home/Hero` plays
  `public/hero.webm`/`hero.mp4` (poster `public/hero-poster.jpg`). The files may
  be absent in git — the `<video>` then renders nothing and the espresso
  background + scrims still read as a clean hero, so don't treat missing assets
  as a bug.
- **Images are placeholders** (`ProductImage` renders colored panels, not real
  photos). Swap that component's body for `next/image` when assets exist.

## Conventions

- Imports use the `@/*` alias → `src/*`.
- Money is rendered via `formatINR` (from `src/data/products.ts`), never hardcoded.
- Reusable buttons: `Button` (real `<button>`) and `ButtonLink` (styled `Link`)
  from `src/components/Button.tsx`; don't hand-roll button styles.
