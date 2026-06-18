# BlackVolt

Marketing + e-commerce website for **BlackVolt**, an Indian D2C liquid coffee
concentrate brand. _A jolt in every drop._

Built with Next.js (App Router) + TypeScript, Tailwind CSS v4, and Framer Motion.
Product and content data live in local TypeScript files; the cart is client-side
(React context + `localStorage`). There is no backend yet — the data layer is
structured so it can be swapped for a real API or CMS later.

## Setup

Requires **Node.js 20.9+**.

```bash
npm install      # install dependencies
npm run dev      # start the dev server at http://localhost:3000
npm run build    # production build (also type-checks)
npm start        # serve the production build
npx eslint .     # lint
```

## Where to customize

Everything brand-related is centralized so a rebrand touches only a few files:

| Want to change…    | Edit                                                                 |
| ------------------ | ------------------------------------------------------------------- |
| **Colors**         | `src/app/globals.css` (`@theme` block) — and mirror in `src/lib/theme.ts` for JS use |
| **Fonts**          | `src/app/layout.tsx` (the `next/font` config drives `--font-display` / `--font-inter`) |
| **Logo**           | `src/components/Logo.tsx` (in-app wordmark) and `public/logo.svg` (standalone asset) |
| **Brand copy/URL** | `src/lib/theme.ts` (`brand` object — name, tagline, description, production URL) |
| **Products**       | `src/data/products.ts` (the SKU seed array + helper functions)        |

> **Colors note:** Tailwind utilities like `bg-charcoal` / `text-gold` are
> generated from the CSS `@theme` tokens. JS/SVG code that can't read a CSS
> variable imports from `src/lib/theme.ts` instead — keep the two in sync.

## Structure

```
src/
  app/            App Router routes: / · /shop · /shop/[slug] · /story · /cart · /contact
                  plus layout.tsx, globals.css, sitemap.ts
  components/     Reusable UI (Logo, Navbar, Footer, Button, Section, ProductCard,
                  Accordion, Reveal, ProductImage, NewsletterForm, ContactForm,
                  home/Hero, shop/ProductPurchase)
  context/        CartContext — CartProvider + useCart (localStorage-backed)
  data/           products.ts — local SKU seed + getters + formatINR
  lib/            theme.ts — brand colors & copy for JS
  types/          shared TypeScript types (Product, CartItem, …)
public/           logo.svg
```

## Notes

- **Images** are placeholder blocks (`ProductImage`) — solid charcoal/gold panels
  stamped with the SKU name. Replace that component's body with `next/image` when
  real photography is ready.
- **Checkout** and **form submissions** (contact, newsletter) are client-side
  stubs. They validate and confirm but don't hit a server.
- Before launch, set the production domain in `brand.url` (`src/lib/theme.ts`) so
  metadata and the sitemap point at the right host.
"# BlackVolt" 
