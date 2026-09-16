# Product

## What this is

A brokerage/marketplace for AI-era digital assets: digital businesses, domains, AI agents, datasets, APIs, and compute. V1 is **not** a self-serve automated marketplace — it optimizes for getting assets listed, getting buyers interested, matching the two, and having a human (admin/broker) facilitate the actual transaction in exchange for a commission.

## Core flows

**Buyer** — browse `/marketplace` with no account, filter/sort, open `/asset/[slug]`. "Request Information" and "Make an Offer" require login (product rule #3) and redirect through `/login?next=...`. A buyer can also describe what they want in free text at `/buy`, which creates a `BuyerRequest` scored against published assets by `src/lib/matching.ts`.

**Seller** — `/sell` picks an asset type, then a type-specific form (fields exactly as specified per type — see `src/lib/validation/asset.ts`). Submission creates an `Asset` with `status: PENDING_REVIEW`; nothing is publicly visible until an admin approves it. `/dashboard` shows the seller's own assets, inquiries, offers, and transactions.

**Admin** — `/admin` moderates listings (approve/reject/request changes/publish/unpublish/mark sold), reviews verification evidence and approves/rejects it, manages users (suspend/verify identity), oversees offers/transactions, and sets per-asset-type commission rates.

## Verification is admin-only, always

A listing can only show a "✓ X verified" badge if an admin approved a `Verification` row for that specific claim. There is no path — client state, form field, seller self-attestation — that sets a verified badge without going through admin review. Evidence documents are never returned by any public read path.

## Matching (V1: rule-based, not AI)

`matchAssetsForBuyerRequest` scores each published asset against a buyer request on five signals — budget fit, asset-type match, business-model keyword overlap, MRR floor (parsed from free text), and growth/low-maintenance fit — and returns a 0-100 score with the specific reasons that contributed, mirroring the spec's "92% match / Why: ✓ ..." example. This is intentionally simple; swapping in LLM-based interpretation of the buyer's free text later doesn't change the function's signature (`Asset[] → {asset, score, reasons}[]`).

## Commission

Default rates (admin-editable via `CommissionRule`): Digital business 7.5%, Domain 10%, AI Agent 10%, Dataset 10%, API 10%, Compute 5%. `computeCommission()` in `src/lib/commission.ts` is a pure function — GMV in, commission + seller proceeds out — called when an offer is accepted to create the `Transaction` row.

## What V1 deliberately does not do

No escrow/payment processing (transaction status is tracked, advanced manually by admin), no GPU orchestration (compute is a valid listing type with no provisioning behind it), no AI listing generation/valuation/fraud detection, no analytics dashboards, no real email delivery (console-logged notifications behind a swappable interface). See ROADMAP.md.

## Seed / demo data

Seed data (`prisma/seed.ts`) is flagged `isSeedData: true` on the `Asset` row and rendered with a "Demo" badge on listing cards — it must never be mistaken for a real listing.
