# Roadmap

## Shipped in this pass (V1, per the spec's "V1 Success Criteria")

Homepage, marketplace browse/filter/sort/search, asset detail pages with broker-mediated contact, seller listing flow (all six asset types), buyer request flow, rule-based matching, admin moderation + verification + user management + commission config, offer → transaction workflow with automatic commission calculation, a swappable email-notification abstraction (console provider), and baseline per-page SEO metadata.

## Deliberately not built yet

These were excluded from this pass per the spec's own "avoid overengineering" instruction and "DO NOT BUILD YET" list — not forgotten, just sequenced later:

- **AI features** (Phase 16): AI listing generation from a rough description, AI categorization, AI valuation estimates, LLM-based buyer-request interpretation (V1 uses keyword/number extraction only), fraud/anomaly detection on submitted metrics. Each is additive — none require changing the `Asset`/`BuyerRequest` schema, they'd sit in front of or alongside the existing forms and matching function.
- **Real email delivery** (Phase 13): the provider abstraction (`src/lib/email/index.ts`) and every trigger point exist now; swapping the console provider for Resend (or similar) is a one-file change plus an API key.
- **Analytics** (Phase 17): GMV/funnel/conversion dashboards. The underlying data (offers, transactions, statuses, timestamps) already exists — this is a reporting layer on top, not a data-model change.
- **Full SEO** (Phase 14): JSON-LD structured data (FAQPage/Product schema) beyond the current title/description/OG metadata, and static (rather than dynamically generated) category landing pages with their own editorial copy.
- **Escrow/payments, GPU orchestration, rate limiting middleware, an audit-log table**: explicitly excluded from V1 by the spec itself ("DO NOT BUILD YET"). Transaction/offer statuses are advanced manually by admin in the meantime.

## Known gaps to close before this is production-ready

- `e2e/01-04*.spec.ts` still test the old product's billing/workspace/role-gating flows and need to be rewritten against the new roles/flows (or removed) — they will fail as-is, not because of a regression but because they test a product that no longer exists here.
- No rate limiting on public mutation endpoints (Server Actions for offers/inquiries/buyer requests) — worth adding before this is publicly exposed at scale.
- No audit log for admin actions (approve/reject/verify/commission changes) — worth adding once there's more than one admin.
