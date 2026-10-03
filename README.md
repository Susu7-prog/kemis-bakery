# Kemi's Artisanal African Bakery & Spice Shop

An e-commerce storefront for Kemi's: breads, pastries, cakes and spice blends, baked and blended in small batches.

> **Status:** Phases 1 to 4 (foundation, global layout, homepage and storefront, product pages and database schema). Google sign-in, Mailgun, checkout and order processing are added in later phases.

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
app/          Routes (/, /shop, /products/[slug], /collections, /about, /login), layout, global CSS, fonts, server actions, sitemap, robots
components/   ui/ (primitives), layout/ (header, footer, cart drawer), home/ (homepage sections), product/
lib/          cart/ (client cart store), data/ (bundled catalogue), supabase/ (public client), products.ts (queries), env, config, format, utils
types/        Shared TypeScript types
styles/       Design tokens (colour, type, radius, breakpoints, motion)
supabase/     migrations/ (schema, constraints, indexes, RLS) and seed.sql (generated)
scripts/      generate-seed.mjs
public/       Static assets, including original product illustrations in public/products/
```

## Catalogue and data source

All catalogue reads go through `lib/products.ts`.

- **Without Supabase variables** (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` unset), it serves the bundled catalogue in `lib/data/products.ts`, so the site runs locally with no setup.
- **With them set**, it reads the `products` table through a cookie-less anonymous client (`lib/supabase/public.ts`). If Supabase is configured but a request fails, the UI shows its error state rather than stale data.

Product images are original SVG illustrations; replace them with photography by changing `image_url` and `gallery_urls`.

## Supabase setup (schema and catalogue)

1. Create a project at supabase.com.
2. In **SQL Editor**, run `supabase/migrations/20261003000000_catalogue_and_orders.sql`, then `supabase/seed.sql`. (Or use the Supabase CLI: `supabase link` then `supabase db push`.)
3. Copy the project URL and anon key (Project Settings, API) into `.env.local`:
   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Restart `npm run dev`. The site now reads products from the database.

After editing `lib/data/products.ts`, regenerate the seed with `npm run db:seed:generate` and re-run it (it upserts by slug).

**Security model.** Row Level Security is on for every table. Anyone can read `products`; nobody but the service role can change them. Customers can read only their own `orders` and `order_items`; there are no insert, update or delete policies, so orders can only be written server-side with `SUPABASE_SERVICE_ROLE_KEY`, which must never be exposed to the browser. Order numbers are generated in the database (`KEMI-10001`, `KEMI-10002`, ...), and `orders.idempotency_key` is unique so a repeated checkout submission cannot create a second order.

## Cart

The cart is a small client store persisted in `localStorage` (`lib/cart/cart-store.ts`). It keeps display snapshots only. Checkout (a later phase) must re-read prices and stock from the database on the server and must never trust cart prices.

## Environment variables

See `.env.example`. Names only; real values go in `.env.local` (git-ignored) and in Vercel project settings.

| Variable | Scope | Phase |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public | 1 |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | 4 (set to use the database) |
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

## Before launch

- Add ingredient and allergen information to every food product (wheat, eggs, milk, peanuts, tree nuts and so on). The product pages do not have this yet.
- Replace draft copy on the homepage and About page with Kemi's real story and policies.
- Replace the illustrations with photography, and add a raster Open Graph image (social previews do not render SVG).
