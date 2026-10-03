# Kemi's Artisanal African Bakery & Spice Shop

An e-commerce storefront for Kemi's: breads, pastries, cakes and spice blends, baked and blended in small batches.

> **Status:** Phases 1 to 3 (foundation, global layout, homepage and storefront). Supabase, Google sign-in, Mailgun, checkout and orders are added in later phases.

## Technology stack

- Next.js (App Router) and React, TypeScript (strict)
- Tailwind CSS v4, with design tokens in `styles/tokens.css`
- Planned: Supabase (PostgreSQL and Auth), Google OAuth, Mailgun, GitHub, Vercel

## Getting started

Requires Node.js 20.9 or newer.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

| Command             | Purpose                             |
| ------------------- | ----------------------------------- |
| `npm run dev`       | Development server                  |
| `npm run typecheck` | TypeScript check                    |
| `npm run lint`      | ESLint                              |
| `npm run build`     | Production build                    |
| `npm run check`     | Typecheck, lint and build in order  |

## Project structure

```text
app/          Routes (/, /shop, /collections, /about, /login), layout, global CSS, fonts, server actions
components/   ui/ (primitives), layout/ (header, footer, cart drawer), home/ (homepage sections), product/
lib/          cart/ (client cart store), data/ (catalogue), products.ts (queries), config, format, utils
types/        Shared TypeScript types
styles/       Design tokens (colour, type, radius, breakpoints, motion)
public/       Static assets, including original product illustrations in public/products/
```

## Catalogue

Products live in `lib/data/products.ts` with the same fields as the planned `products` table, and are read only through `lib/products.ts`. Moving to Supabase means changing that one module. Product images are original SVG illustrations; replace them with photography by changing `imageUrl`.

## Cart

The cart is a small client store persisted in `localStorage` (`lib/cart/cart-store.ts`). It keeps display snapshots only. Checkout (a later phase) must re-read prices and stock from the database on the server and must never trust cart prices.

## Environment variables

See `.env.example`. Names only; real values go in `.env.local` (git-ignored) and in Vercel project settings.

| Variable | Scope | Phase |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public | 1 |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | 4 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | 4 |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** | 4 |
| `MAILGUN_API_KEY` | **Server only** | 8 |
| `MAILGUN_DOMAIN` | **Server only** | 8 |
| `MAILGUN_FROM_EMAIL` | **Server only** | 8 |

## Supabase, Google OAuth, Mailgun and deployment

Setup guides are added to this README in the phase that introduces each one.

## Design notes

- Palette: hibiscus (zobo) crimson as the single accent, turmeric as a small highlight, cocoa ink on warm neutrals.
- Typefaces: Bricolage Grotesque (headings) and Instrument Sans (text), self-hosted from `app/fonts`.
- Motion is limited to one hero entrance and drawer transitions, and respects `prefers-reduced-motion`.
