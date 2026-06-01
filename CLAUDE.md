# Mid Mo Roll Offs — Developer Reference

## Stack
- **Next.js 14** App Router, TypeScript strict, Tailwind CSS
- **Auth**: NextAuth v4, CredentialsProvider, JWT, `pages.signIn: '/login'`
- **DB**: Prisma + PostgreSQL (see `prisma/schema.prisma`)
- **State**: TanStack Query v5 + Zustand (`store/useNewJobModal.ts`)
- **Maps**: react-leaflet v4 — SSR-safe via `dynamic(..., { ssr: false })` in `MapWrapper.tsx`
- **Payments**: Stripe (`lib/stripe.ts`), Venmo deep-link via Twilio SMS
- **PDF**: `@react-pdf/renderer` server-only in `app/api/invoices/[id]/pdf/route.ts`

## Design System
- Dark forest-green glassmorphism
- CSS vars set in `app/globals.css`: `--color-mint`, `--color-mint-muted`
- Tailwind classes: `glass-card`, `text-mint`, `text-mint-muted`, `touch-scroll`
- Status pills: `pill-active` (green), `pill-due` (amber), `pill-overdue` (red), `pill-scheduled` (blue)
- Fonts: Inter (body) + Fira Code (monospace numbers)

## Key Files
| File | Purpose |
|------|---------|
| `lib/mock-data.ts` | Static export mock data + `IS_STATIC` flag |
| `lib/auth.ts` | NextAuth config |
| `lib/api-helpers.ts` | `requireAuth`, `validateBody`, `handleApiError`, `successResponse` |
| `lib/validations/` | Zod schemas shared between API routes and frontend |
| `middleware.ts` | withAuth, owner-only /settings, excludes /api/stripe/webhook |
| `store/useNewJobModal.ts` | Global Zustand store — `open(prefill?)`, `close()` |
| `components/map/MapWrapper.tsx` | SSR-safe Leaflet wrapper via dynamic import |
| `components/map/LeafletMap.tsx` | Imports `leaflet/dist/leaflet.css` INSIDE this file |
| `components/map/DumpsterMarker.tsx` | SVG divIcon (no PNG = no Webpack 404) |

## Static Export (GitHub Pages)
- Built with `NEXT_PUBLIC_STATIC_EXPORT=true`
- `next.config.mjs` activates `output: 'export'`, `basePath: '/MIDMO'`, `trailingSlash: true`
- `.github/workflows/pages.yml` runs `rm -rf app/api` before build (API routes incompatible)
- **All hooks and inline fetches** check `IS_STATIC` from `lib/mock-data.ts` and return mock data
- **Never** add `export const dynamic = 'force-dynamic'` to page files — incompatible with static export
- Live URL: **https://koobicheck-gif.github.io/MIDMO**

## Seed Credentials
- Owner: `owner@midmorolloffs.com` / `changeme123`
- Driver 1: `jake@midmorolloffs.com` / `changeme123`
- Driver 2: `marcus@midmorolloffs.com` / `changeme123`

## DB Setup
```bash
npx prisma db push
npx prisma db seed   # ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts
```

## Enums (Prisma)
- `Role`: OWNER | DRIVER | OFFICE
- `DumpsterStatus`: IN_YARD | ACTIVE | PICKUP_DUE | OVERDUE | SCHEDULED | MAINTENANCE
- `JobType`: DELIVERY | PICKUP | SWAP
- `JobStatus`: SCHEDULED | IN_PROGRESS | COMPLETED | CANCELLED
- `InvoiceStatus`: DRAFT | PENDING | PAID | OVERDUE | PARTIAL
- `PaymentMethod`: STRIPE | VENMO | CASH | CHECK | ZELLE | ACH | MONEY_ORDER | OTHER

## API Routes
All routes require auth via `requireAuth()`. Key patterns:
- GET list: `?status=`, `?limit=`, `?from=`/`?to=` date range
- Stripe webhook: uses `request.text()` (raw body) before any JSON parse
- PDF route: must NOT be Edge runtime; `@react-pdf/renderer` is server-only

## Pages
| Route | Component | Notes |
|-------|-----------|-------|
| `/` | `app/(dashboard)/page.tsx` | Dashboard: stats, mini-map, activity feed |
| `/assets` | `app/(dashboard)/assets/page.tsx` | Full-screen Leaflet map + sidebar |
| `/fleet` | `app/(dashboard)/fleet/page.tsx` | Dumpster card grid, filter by status |
| `/crm` | `app/(dashboard)/crm/page.tsx` | Customer list + detail panel + NewCustomerModal |
| `/billing` | `app/(dashboard)/billing/page.tsx` | 6 tabs: Invoices, Payments, Stripe, Venmo, SelfRecord, CreateInvoice |
| `/dispatch` | `app/(dashboard)/dispatch/page.tsx` | Date picker + DnD driver columns (drag to reassign) |
| `/reports` | `app/(dashboard)/reports/page.tsx` | Recharts: revenue, fleet, payment methods, invoice aging |
| `/settings` | `app/(dashboard)/settings/page.tsx` | Owner-only; company info, pricing, integrations |

## Env Vars Required
```
NEXTAUTH_SECRET, NEXTAUTH_URL, DATABASE_URL
STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
RESEND_API_KEY
CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
```

## Branch
Development branch: `claude/keen-davinci-fWYBc` → merge to `main` to deploy Pages
