# Database

Source of truth: `prisma/schema.prisma`. This is a summary, not a duplicate — read the schema for exact field types/constraints.

## Provider

PostgreSQL, the same instance Supabase already provisions for auth. Two connection strings are required in `.env.local` (get both from the Supabase project's Database settings):

- `DATABASE_URL` — pooled connection (pgbouncer), used at runtime.
- `DIRECT_URL` — direct connection, used only by `prisma migrate` (migrations can't run through a pooler).

Supabase's own `auth.users` table is untouched by Prisma; `User.id` is the same UUID as `auth.users.id`, linked by convention (application code), not a DB-level foreign key across schemas.

## Models

| Model | Purpose |
|---|---|
| `User` | App-facing profile (company/bio/country/website/role). Lazily created on first authenticated request — see `src/lib/auth.ts`. `role` is a UI default persona, not a hard permission boundary (a user can buy and sell); only `role === ADMIN` gates anything. |
| `Asset` | Every listing, any type. Shared fields (title, price, revenue, growth, etc.) are real columns for filtering/sorting; type-specific fields live in `metadata` (JSON), validated per type by zod at write time. `verificationSummary` is denormalized from `Verification` rows for fast badge rendering — recomputed whenever a `Verification` changes. `isSeedData` marks demo listings. |
| `Verification` | One row per claim (`REVENUE_VERIFIED`, `TRAFFIC_VERIFIED`, etc.) with `PENDING/APPROVED/REJECTED` status. `evidence` is a private object-storage reference, never exposed by public reads. |
| `BuyerRequest` | Free-text "what I'm looking for" from `/buy`, scored against `Asset` rows on demand (not a persisted match table). |
| `Inquiry` | "Request Information" broker-mediated contact — does not expose seller PII to the buyer directly. |
| `Offer` | Buyer/seller negotiation on one asset. Status machine: `SUBMITTED → SELLER_REVIEW → COUNTERED → ACCEPTED/REJECTED/EXPIRED → COMPLETED`. |
| `Transaction` | Created when an `Offer` is accepted. Stores `agreedPrice`, `commissionRate`, `commissionAmount`, `sellerProceeds` — all computed at creation time via `src/lib/commission.ts`, not recomputed later even if the admin changes the rate afterward. |
| `CommissionRule` | Admin-editable rate per `AssetType`, falls back to `DEFAULT_COMMISSION_RATES` in `src/lib/commission.ts` if unset. |

## Migrations

```
npx prisma migrate dev --name <change>   # local: creates + applies a migration
npx prisma generate                      # regenerate the client after schema changes
npx prisma db seed                       # run prisma/seed.ts
```

## Indexes

`Asset` is indexed on `(assetType, status)` and `(status, createdAt)` — the two access patterns the marketplace grid actually uses (filter by type+status, sort newest-first within a status). Add indexes as real filter/sort combinations get slow, not preemptively.
