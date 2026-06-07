# Mid Mo Roll Offs — Operations Hub

Internal operations app for Mid Mo Roll Offs dumpster rental (Columbia, MO). Mobile-first, driver/owner-facing. Built with Next.js 14, dark forest-green glassmorphism design.

**Static demo (GitHub Pages):** https://koobicheck-gif.github.io/MIDMO  
**Production (Vercel):** _add URL after deploy_

---

## What's Built

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | KPI stats, mini Leaflet map, activity feed, revenue chart |
| Assets | `/assets` | Full-screen dark map + sidebar, fly-to on click |
| Fleet | `/fleet` | Dumpster card grid, filter by status, open job modal from card |
| CRM | `/crm` | Customer list + detail panel + Add Customer modal |
| Billing | `/billing` | 6 tabs: Invoices, Payments, Stripe, Venmo, Self-Record, Create Invoice |
| Dispatch | `/dispatch` | Date picker + drag-to-assign DnD driver columns |
| Reports | `/reports` | Recharts: revenue, jobs by type, fleet utilization, payment methods, invoice aging |
| Settings | `/settings` | Owner-only: company info, pricing tiers, integration status |

---

## Stack

```
Next.js 14 App Router   TypeScript strict   Tailwind CSS
NextAuth v4             Prisma + PostgreSQL  TanStack Query v5
Zustand                 react-leaflet v4     Recharts
Stripe                  Twilio SMS           Resend (email)
Cloudinary              @react-pdf/renderer  @dnd-kit
```

---

## Quick Start (local dev)

```bash
npm ci --legacy-peer-deps
cp .env.example .env.local   # fill in your values
npx prisma db push
npx prisma db seed
npm run dev
```

Login at `http://localhost:3000/login`:
- Owner: `owner@midmorolloffs.com` / `changeme123`
- Driver 1: `jake@midmorolloffs.com` / `changeme123`
- Driver 2: `marcus@midmorolloffs.com` / `changeme123`

---

## Deployments

### GitHub Pages (static UI demo)
Triggers automatically on push to `main`. No server required — all data is mock.

**Workflow:** `.github/workflows/pages.yml`
- Removes `app/api/` before build (incompatible with `output: export`)
- Builds with `NEXT_PUBLIC_STATIC_EXPORT=true`
- Deploys `./out` to GitHub Pages

To activate: **Settings → Pages → Source → GitHub Actions**

### Vercel (full production)
Triggers on push to `main` via `.github/workflows/deploy.yml`.

**Build command** (set in `vercel.json`):
```
prisma generate && prisma migrate deploy && next build
```

**GitHub secrets needed:**
```
VERCEL_TOKEN        — vercel.com → Account Settings → Tokens
VERCEL_ORG_ID       — from .vercel/project.json after vercel link
VERCEL_PROJECT_ID   — same file
```

**Stripe webhook:** Add endpoint `https://your-app.vercel.app/api/stripe/webhook`, event `payment_intent.succeeded`.

**First deploy — seed the database:**
```bash
npx vercel env pull .env.local
npx prisma db seed
```

---

## Environment Variables

See `.env.example` for all keys with signup links. Required:

```bash
# Database (Neon recommended)
DATABASE_URL=postgresql://...?sslmode=require

# Auth
NEXTAUTH_SECRET=     # openssl rand -base64 32
NEXTAUTH_URL=        # https://your-app.vercel.app

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Twilio
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...

# Resend
RESEND_API_KEY=re_...

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

App validates all vars at startup via `lib/env.ts` (throws in production on missing config).

---

## Architecture

### Static Export Mode
When `NEXT_PUBLIC_STATIC_EXPORT=true`, the entire app runs on mock data — no API calls are made. Every hook and inline fetch checks `IS_STATIC` from `lib/mock-data.ts`.

**Critical rules:**
- Never add `export const dynamic = 'force-dynamic'` to page files (breaks static export)
- Never import server-only libs (`prisma`, `stripe`) in client components
- Leaflet CSS must be imported inside `LeafletMap.tsx`, not in the dynamic wrapper

### Auth & Roles
- `middleware.ts` — JWT auth on all routes, owner-only `/settings`, `/api/stripe/webhook` excluded
- `lib/auth.ts` — timing-safe bcrypt login, 10-attempt rate limit per IP/email, 8-hour JWT
- `lib/api-helpers.ts` — `requireAuth()`, `requireRole(['OWNER','OFFICE'])`, `validateEnum()`

**Role permissions:**
| Action | DRIVER | OFFICE | OWNER |
|--------|--------|--------|-------|
| View all jobs | ✗ (own only) | ✓ | ✓ |
| Mark job complete | ✓ (own only) | ✓ | ✓ |
| Create/edit jobs | ✗ | ✓ | ✓ |
| Manage customers | ✗ | ✓ | ✓ |
| Invoices & payments | ✗ | ✓ | ✓ |
| Settings | ✗ | ✗ | ✓ |
| Delete anything | ✗ | ✗ | ✓ |

### Database
Prisma schema: `prisma/schema.prisma`

Enums:
- `Role`: `OWNER | DRIVER | OFFICE`
- `DumpsterStatus`: `IN_YARD | ACTIVE | PICKUP_DUE | OVERDUE | SCHEDULED | MAINTENANCE`
- `JobType`: `DELIVERY | PICKUP | SWAP`
- `JobStatus`: `SCHEDULED | IN_PROGRESS | COMPLETED | CANCELLED`
- `InvoiceStatus`: `DRAFT | PENDING | PAID | OVERDUE | PARTIAL`
- `PaymentMethod`: `STRIPE | VENMO | CASH | CHECK | ZELLE | ACH | MONEY_ORDER | OTHER`

```bash
npm run db:generate   # prisma generate
npm run db:push       # push schema without migration (dev)
npm run db:migrate    # prisma migrate dev (creates migration)
npm run db:seed       # seed with Columbia MO sample data
npm run db:studio     # open Prisma Studio
```

### Maps
- `MapWrapper.tsx` — `dynamic(() => import('./LeafletMap'), { ssr: false })` (SSR-safe)
- `LeafletMap.tsx` — imports `leaflet/dist/leaflet.css` **inside this file only**
- `DumpsterMarker.tsx` — SVG `divIcon` (no PNG = no Webpack 404 on Next.js)
- Tiles: CartoDB Dark Matter (`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`)

### Global State
```ts
// Open the New Job modal from anywhere — map pins, fleet cards, CRM
useNewJobModal.getState().open({ customerId, dumpsterId, address, lat, lng })
```
Store: `store/useNewJobModal.ts`

### API Routes
All routes:
- Require auth via `requireAuth(request)` — also enforces per-user rate limit (120 req/min)
- Use `validateBody(ZodSchema, body)` for input validation
- Use `validateEnum(value, ALLOWED_VALUES)` for query params — never `as any`
- Return errors via `handleApiError(error)` — stack traces never reach the client

Special cases:
- `/api/stripe/webhook` — reads raw body with `request.text()` **before** any JSON parse
- `/api/invoices/[id]/pdf` — server-only, must NOT be Edge runtime
- `/api/upload` — MIME + extension + magic-byte validation, 5MB limit, OWNER/OFFICE only

### Security Headers
Set in `next.config.mjs` on every response (live deploy only, not static export):
- `Content-Security-Policy` — locks scripts/frames/connections to known origins
- `X-Frame-Options: DENY`
- `Strict-Transport-Security` (production only)
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` — disables camera/mic/interest-cohort

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `lib/mock-data.ts` | All mock data + `IS_STATIC` flag |
| `lib/auth.ts` | NextAuth config, rate-limited timing-safe login |
| `lib/api-helpers.ts` | Auth guards, validation, error handling |
| `lib/rate-limit.ts` | In-memory rate limiter (swap for Redis in multi-instance prod) |
| `lib/env.ts` | Zod env validation at startup |
| `lib/validations/` | Zod schemas shared between API + frontend |
| `middleware.ts` | JWT enforcement, owner-only `/settings` |
| `store/useNewJobModal.ts` | Global job creation modal state |
| `components/map/LeafletMap.tsx` | Leaflet CSS imported here — nowhere else |
| `components/map/DumpsterMarker.tsx` | SVG divIcon, color by status |
| `prisma/migrations/` | SQL migrations — run via `prisma migrate deploy` on Vercel |

---

## Design System

**Colors:** Dark forest-green glassmorphism  
**CSS vars** (`app/globals.css`): `--color-mint`, `--color-mint-muted`  
**Fonts:** Inter (body) + Fira Code (numbers via `font-mono`)

| Class | Use |
|-------|-----|
| `glass-card` | Standard card with backdrop blur |
| `text-mint` | Primary light text |
| `text-mint-muted` | Secondary text |
| `touch-scroll` | Horizontal scroll with `-webkit-overflow-scrolling: touch` |
| `pill-active` | Green status badge |
| `pill-due` | Amber status badge |
| `pill-overdue` | Red status badge |
| `pill-scheduled` | Blue status badge |

---

## Adding a Feature

1. **New page** — create `app/(dashboard)/your-page/page.tsx`, add to `Sidebar.tsx` + `MobileNav.tsx`
2. **New API route** — copy pattern from any existing route; always use `requireAuth`, `validateBody`, `validateEnum`
3. **New DB model** — edit `prisma/schema.prisma`, run `npm run db:migrate`, update `lib/mock-data.ts` with mock entries
4. **Static export compatibility** — add `IS_STATIC` check to any new hook or inline fetch
5. **Deploy** — push to `main`; Vercel deploys automatically, GitHub Pages builds static demo
