# Architecture

## Stack

- **Next.js 15 (App Router), TypeScript, React 19** — single deployable, server components by default.
- **Prisma + PostgreSQL** — the marketplace's data layer, hosted on the same Postgres instance Supabase already provisions for auth. Prisma owns everything under the `public` schema; Supabase's `auth.users` remains the credential/session store.
- **Supabase Auth** (`@supabase/ssr`) — signup/login/session, unchanged from before the pivot.
- **Tailwind v4 + shadcn/ui** — design system, `components.json` config carried over as-is.
- **React Query** — client-side data fetching/caching for interactive pieces (forms with optimistic UI, admin tables).
- **Zod** — request validation, one schema per asset type (`src/lib/validation/asset.ts`).

There is **no separate backend service** for this product. The previous Java/Spring service (`titer-backend`) served the old "Titer" product and is not used here — all reads/writes go through Next.js Server Actions and Route Handlers calling Prisma directly.

## Request flow

```
Browser
  → Server Component (reads via prisma directly, no fetch/JSON hop)
  → Server Action (mutations: create listing, submit offer, approve verification, ...)
      → zod validation
      → prisma write
      → revalidatePath / redirect
```

Client Components only exist where interaction requires it (forms, the admin tables, buyer-request builder). Everything else renders on the server.

## Directory layout

```
prisma/schema.prisma       Data model (see DATABASE.md)
prisma/seed.ts             Seed script (demo listings)
src/lib/db.ts              Prisma client singleton
src/lib/auth.ts            getCurrentUser/requireUser/requireAdmin — Supabase session -> Prisma User
src/lib/validation/        Zod schemas, one per asset type
src/lib/matching.ts        Buyer-request <-> asset scoring (rule-based, see PRODUCT.md)
src/lib/commission.ts      Commission rate lookup + pure calculation
src/lib/email/             Notification abstraction (console provider by default)
src/lib/format.ts          Currency/number/enum-label formatting shared by cards, detail pages, admin
src/app/(public)/          Homepage, marketplace, asset detail, sell, buy, how-it-works, about — indexable, no auth required to browse
src/app/(auth)/            Login/signup
src/app/(app)/dashboard/   Seller/buyer dashboard — requires a session
src/app/admin/             Admin panel — requires role=ADMIN, checked server-side in its layout
src/components/ui/         shadcn primitives (kept from the pre-pivot app)
src/components/marketplace/  Listing card, filters, verification badges
src/components/auth/       Auth form, logout button (kept, rebranded)
src/components/layout/     Site header/footer, mobile nav
```

## Auth & authorization

- Supabase remains the identity provider. `src/middleware.ts` → `updateSession` redirects unauthenticated requests away from `/dashboard`, `/sell`, `/admin` (public browsing is intentionally excluded — product rule #1).
- `getCurrentUser()` (`src/lib/auth.ts`) resolves the Supabase session and lazily upserts a matching Prisma `User` row keyed by the same UUID — there's no separate "finish your profile" step.
- Admin access is **not** middleware-only: `src/app/admin/layout.tsx` calls `requireAdmin()` server-side on every request, so a stale client state or a crafted request can't reach admin data. Never trust a client-supplied role.

## Why one `Asset` table, not one per type

Six asset types (business, domain, agent, dataset, API, compute) with six very different field sets would either mean six tables with a lot of shared-column duplication, or a table-per-type join that the marketplace grid has to fan out across for every listing/filter query. Instead: one `Asset` table with the fields every type shares as real columns (title, price, revenue, growth, etc. — so filtering/sorting stays a normal indexed query), and everything type-specific in a `metadata` JSON column validated per type by zod at write time (`src/lib/validation/asset.ts`). This matches the spec's "avoid overengineering" instruction and can be split into per-type tables later if a type's fields need their own indexes or relations.

## Deferred (see ROADMAP.md)

AI valuation/fraud-detection, analytics dashboards, real transactional email delivery, full JSON-LD structured data, and payment/escrow integration are explicitly out of scope for this pass — see ROADMAP.md for why and when.
