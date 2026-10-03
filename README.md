# NOVA

A premium e-commerce storefront for considered everyday objects: lighting, ceramics, desk pieces and textiles.

> **Status:** Phase 1 (foundation). Supabase, Google sign-in, Mailgun, checkout and orders are added in later phases.

## Technology stack

- Next.js (App Router) and React
- TypeScript (strict)
- Tailwind CSS v4 (design tokens in `styles/tokens.css`)
- Supabase (PostgreSQL and Auth), Google OAuth, Mailgun: planned
- GitHub and Vercel for source control and hosting

## Getting started

Requires Node.js 20.9 or newer.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. A reference page for the design foundation lives at `/styleguide`.

## Scripts

| Command             | Purpose                                        |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Start the development server                   |
| `npm run typecheck` | TypeScript check                               |
| `npm run lint`      | ESLint                                         |
| `npm run build`     | Production build                               |
| `npm run check`     | Typecheck, lint and build in sequence          |

## Project structure

```text
app/          Routes, layouts, global CSS, fonts
components/   ui/ (primitives), layout/ (shell), home/ (homepage sections)
lib/          Utilities and site configuration
types/        Shared TypeScript types
styles/       Design tokens (colour, type, radius, breakpoints, motion)
public/       Static assets
```

Later phases add `lib/supabase/`, `lib/email/`, `lib/validation/` and `lib/orders/` so UI, business logic, database and email stay separate.

## Environment variables

See `.env.example`. Variable names only; real values go in `.env.local` (git-ignored) and in Vercel project settings.

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

Setup guides for each are added to this README in the phase that introduces them.

## Design notes

- Typefaces (Bricolage Grotesque for headings, Instrument Sans for text) are self-hosted from `app/fonts`, so builds need no external font requests.
- One accent colour (cobalt) on a cool neutral base; radii are small by design.
- Motion is limited and respects `prefers-reduced-motion`.
