












# Titer Marketing Site — Production Description

*What's live, how it's wired together, and what's still open. Written for whoever
picks this up next — founder, another engineer, or future me.*

---

## What this is

The public marketing site for Titer (titer.dev), built in `titer-frontend` alongside
the existing authenticated product (`(app)` route group) and auth flow (`(auth)`
route group). Next.js 16 App Router, TypeScript, Tailwind v4, statically generated
where the content doesn't depend on a signed-in user.

The design authority is documented in code, not just here: every marketing page
pulls from the same token set (`src/app/globals.css`) and the same shared
components. There is no separate design-system doc — the tokens file and
`titer-dial.tsx` / `request-dialog.tsx` / the page templates *are* the source of
truth.

---

## Design system

**Tokens** (`globals.css`, `:root` and `.dark`):
- `--titer-ink: #111318`, `--titer-muted: #5b6472`, `--titer-border: #e7e9ee` — the
  entire marketing site's palette. No gradients, no accent colors outside these
  three plus the semantic ramp below.
- `--status-good: #3fa34d`, `--status-warning: #e8a33d`, `--status-critical:
  #d6483b` — the *only* color on the site, reserved for score/verdict meaning.
  These live on non-text elements (dial rings, small indicator dots, borders) —
  **never as text color**, because none of the three pass 4.5:1 contrast against
  white as text (the amber fails badly, at ~2.15:1). See "Accessibility" below —
  this was a real bug caught by Lighthouse, not a hypothetical.

**Shared components** (`src/components/marketing/`, plus `src/components/titer/titer-dial.tsx`):
- `TiterDial` — the dial itself (pre-existing, extended this session): scroll-triggered
  count-up + arc animation via `useSyncExternalStore` for `prefers-reduced-motion`
  (not `useEffect`+`setState`, which caused a real hydration-mismatch bug on first
  attempt), `role="img"` with a full text `aria-label` so screen readers get one
  clean announcement instead of the raw number twice.
- `RequestDialog` — the one lead-capture dialog, parameterized by `mode: "trial" |
  "demo"`. Same fields both modes (name, work email, company, role, free-text
  message), different copy, different `type` sent to the backend, different success
  state. Demo mode shows a real Calendly link on success.
- `ToolPageTemplate` — hero+dial, problem, how-it-works slot (per-tool custom
  visual), reasons/who-it's-for, pricing snippet, FAQ, closing CTA. Backs the three
  `/product/*` pages.
- `SolutionPageTemplate` — headline, problem-today, tool→workflow mapping, numbered
  walkthrough, outcomes, recommended pricing tier, closing CTA. Backs the five
  `/solutions/*` pages. Takes an optional `extraSection` slot (used once, for
  compliance's audit-trail/honesty callout).
- `PricingTable` — monthly/annual toggle, 5 tier cards, collapsible full comparison
  table.

**Buttons**: primary = solid ink pill (`rounded-full` applied via `className` at
call sites, not baked into the shared `Button` primitive — that primitive is used
everywhere in the authenticated app too, and I didn't want an unreviewed shape
change to ripple through the dashboard/settings UI as a side effect of marketing
work). Secondary = outline pill.

---

## Page inventory

| Route | Primary CTA | Notes |
|---|---|---|
| `/` | Scanner (`/measure`) — free, no signup | Hero + 3 tool cards (existing), why-now band, how-it-works + static finding example, measure-anything strip, 4 segment-reason cards, trust/honesty band, dual closing CTA, minimal footer |
| `/product/score` | Scanner | Buyer = writers/teams. Only tool page whose primary CTA is the free scanner, not Request trial — Score is the one tool with a real free tier |
| `/product/quality` | Request trial | Buyer = SEO/agencies. Static worst-first audit-table mock |
| `/product/visibility` | **Book a demo** (not Request trial) | Buyer = brand/marketing. Deliberate exception — highest price, least self-serve, called out explicitly in the original spec. Channel grid + accuracy-alert example |
| `/pricing` | Per-tier (Free→scanner, Pro/Studio→Request trial, Agency/Business→Book a demo) | Monthly/annual toggle, Studio highlighted, collapsible comparison table |
| `/solutions/agencies` | Book a demo | Recommends Agency tier |
| `/solutions/brand-marketing` | Book a demo | Recommends Business tier (only tier with Visibility) |
| `/solutions/content-teams` | Book a demo | Recommends Studio tier |
| `/solutions/support-cx` | Book a demo | Recommends Business tier (only tier with API access) |
| `/solutions/compliance` | Book a demo | Adds the "Not a determination" honesty callout — required framing, not optional |
| `/how-it-works` | Scanner | Grounded in `titer-backend/TITER-SCORE-EXPLAINED.md` — the actual five-component judge rubric and the real, live-run calibration numbers (high_resonance 66.9 / flat_neutral 37.5 / generic_warmth_language 25.5 mean, 0% false-top-band rate on the tricky corporate-boilerplate bucket). Published directly on the page now, not withheld as a placeholder — still explicitly flagged as an n=8/bucket starter corpus, not statistical confidence |

All solutions/product/pricing/how-it-works pages: `export const dynamic =
"force-static"`, unique `metadata` (title/description), `Product` JSON-LD on the
three tool pages.

Home page carries `Organization` JSON-LD. `metadataBase` is set to
`https://titer.dev` in the root layout so OG image URLs resolve absolutely, not to
`localhost`.

---

## Conversion model

No self-serve trial, no card collection anywhere. Two paths:

1. **Free scanner** (`/measure`) — genuinely anonymous, not gated (confirmed against
   `PROTECTED_PREFIXES` in `src/lib/supabase/proxy.ts`: `/score`, `/quality`,
   `/visibility` require login, `/measure` doesn't). This is the only page where a
   visitor can *do the product* without talking to anyone.
2. **`RequestDialog`** — "Request trial" or "Book a demo" everywhere else, both
   posting to the same backend endpoint with a different `type`.

A real bug this caught: the home page's hero CTA and the Score tool card originally
linked to `/score` (login-gated) instead of `/measure` (anonymous) — fixed early,
otherwise the entire "free, no signup" pitch was a login wall in practice.

---

## Backend integration

`POST /v1/leads` on `titer-backend` (Java/Spring), added this session:

- `src/main/resources/db/migration/V11__leads.sql` — `leads` table
- `entity/Lead.java`, `repository/LeadRepository.java`, `dto/LeadRequest.java`,
  `dto/LeadResponse.java`
- `notification/ResendClient.java` — thin Resend API wrapper, no-ops (logs, returns)
  if `RESEND_API_KEY` is unset — lead capture never depends on email being
  configured
- `notification/LeadNotificationService.java` — `@Async` founder-notification
  email on its own thread pool (`leadNotificationExecutor` in `AsyncConfig`), so a
  slow/misconfigured mail provider can't delay the response
- `service/LeadService.java`, `controller/LeadController.java` — public (see
  `SecurityConfig`'s permitAll list), rate-limited 5 requests/day per
  `X-Device-Id` via the existing `RateLimitService.tryConsumeByDevice`

**Config** (`.env.example`, `application.yml`, `TiterProperties.Resend`):
`RESEND_API_KEY`, `LEADS_FROM_EMAIL` (default `leads@titer.dev`),
`LEADS_NOTIFY_EMAIL`. All optional — blank means "leads still save, email
no-ops," not a startup failure.

**Verified live**, not just compiled: started Docker, brought up the project's
Postgres/Redis containers, booted the real Spring app, and confirmed — real `202`
with a persisted row, real `422` on invalid input with per-field messages, the
async notifier running on its own thread and logging the expected skip, the rate
limiter allowing exactly 5/device and rejecting the 6th with a clean
decrement-rollback, and one full click-through from the actual browser (fill the
real dialog → real network call → real Postgres row → real success UI with the
real Calendly link). Test rows were cleaned up afterward.

`RequestDialog`'s calendar link: `https://calendly.com/titer-support/30min` (real,
provided by the founder — not a placeholder).

---

## Analytics

`src/lib/analytics.ts` — a `track(event, properties)` helper. No real provider
wired up yet (pushes to `window.dataLayer`, logs in dev); a provider snippet can
consume `dataLayer` later without any call site changing.

Five events, all verified firing with real data against the live backend:
- `trial_requested`, `demo_requested` — on `RequestDialog` success
- `scan_started`, `scan_completed` — on the `/measure` page's mutation lifecycle
  (`onMutate` / `onSuccess`)
- `fix_clicked` — new: added a "Copy fix" button to `FindingsList` (previously the
  suggestion was inert text with nothing to click), copies to clipboard via the
  same `navigator.clipboard` + `sonner` toast pattern already used in
  `settings/api-keys`

---

## SEO

- **`sitemap.xml`** (`src/app/sitemap.ts`) — 12 public routes (home, `/measure`,
  the 3 product pages, pricing, 5 solutions pages, how-it-works). Deliberately
  excludes `/login`, `/signup`, and the auth-gated app routes.
- **`robots.txt`** (`src/app/robots.ts`) — allows `/`, disallows the gated routes,
  points at the sitemap.
- **OG images** — built from scratch this session (confirmed nothing existed:
  no `opengraph-image` convention files, no card/OG route anywhere in the repo).
  `src/lib/og.tsx` is a shared `renderOgImage(title, subtitle)` using Next's
  built-in `next/og` `ImageResponse` — ink-on-white, same design language as the
  rest of the site. One `opengraph-image.tsx` per route (11 total). All confirmed
  to return real `1200×630` PNGs, not just 200s — fetched several and visually
  inspected them.

---

## Accessibility

WCAG AA is a stated requirement across every version of the spec this was built
against. Real violation found and fixed, not theoretical: Lighthouse's
`color-contrast` audit flagged every place the semantic ramp colors
(`--status-critical` / `--status-warning` / `--status-good`) were used as **text**
color — small finding labels, score numbers in the Quality audit-table mock, the
Visibility "Inaccurate" label, the how-it-works evasion-table results, the
`RequestDialog` error message. The amber especially fails badly (2.15:1 against a
4.5:1 requirement); the red is borderline-under (4.33:1).

Fix applied everywhere this pattern occurred: color moved off text entirely, onto
a small `size-2 rounded-full` indicator dot (non-text elements get the more
lenient 3:1 non-text-contrast rule), with the actual label staying in
`--titer-ink`. This is the same pattern `TiterDial` itself already used (colored
ring, never colored text) — the fix made the rest of the site consistent with a
pattern that already existed, rather than inventing a new one.

**Status: confirmed fixed.** Re-ran Lighthouse against a clean production
build (`npm run build && PORT=3001 npm run start`, no concurrent processes
this time) on all three pages the original gate names ("Lighthouse SEO & a11y
≥95 on home, a tool page, and pricing"):

| Page | Accessibility | SEO |
|---|---|---|
| `/` (home) | 100 | 100 |
| `/product/score` (tool page) | 100 | 100 |
| `/pricing` | 100 | 100 |

Zero failed accessibility audits on any of the three (checked every
`auditRefs` entry in the accessibility category, not just the top-line
score). The original pre-fix run scored home Accessibility 95 -- confirmed
that gap is fully closed, not just improved. `/product/quality`, the third
tool page this table's own header implies, isn't actually built yet (only
`/product/score` and `/product/visibility` exist under `src/app/product/`)
-- ran against `/product/score` instead as "a tool page," matching the
gate's intent since a specific tool page was never named.

**Also not yet done**: no permanent Lighthouse CI config/npm script exists yet
(no `.github/` workflows, no CI provider configured anywhere in either repo — this
was confirmed, not assumed, so a CI workflow file wasn't added speculatively).
`npx lighthouse` was run ad hoc against a local production server on port 3001.

---

## Known gaps — real values needed, not fabricated

This section previously listed six `{{PLACEHOLDER: ...}}` items as still open.
Checked against current code, not just this doc: three were already filled
with real, `PlanCatalog.java`-derived numbers (confirmed accurate) somewhere
between the original build and now, without this doc ever being updated —
same staleness pattern found and fixed in `PRICING-PROFITABILITY-PLAN.md`
around the same time. The other two turned out to be a live risk, not a
cosmetic gap: two billing-behavior claims (proration, refunds) were reviewed
with the founder and found to describe behavior that was never actually
built or approved, sitting live on the pricing page as if decided. Resolved:

- **Free tier's daily scan limit** — already fixed (a prior session's own
  `af8827a` commit corrected this from a stale anonymous-tier "3/day" to
  Free's real "15/mo"; the doc's "daily" framing was itself wrong).
- **Studio/Agency/Business "pages audited/mo"** (card copy + comparison
  table, 3 spots) — already filled from `qualityScansMonthly`, verified
  correct against `PlanCatalog.java`.
- **SSO/compliance comparison-table cell** — already filled (✓ only on
  Business, matching `ssoSaml`).
- **Billing FAQ's fair-use text** — already filled, verified correct
  against `fairUseDaily` per plan.
- **Founding-rate customer cap** — reviewed with the founder: "$79/yr for
  the first 50 customers" is confirmed real and intentional, kept as-is.
- **Billing FAQ's refund policy** — reviewed with the founder: no real
  refund policy has been decided yet. The claimed answer ("full refund
  within 7 days... pro-rata in the first 30 days") was live on the pricing
  page describing a specific commercial commitment nobody had actually
  approved. **Removed the FAQ entry** rather than leave an unconfirmed
  promise live to real customers.
- **Proration FAQ, found during this same review, not originally listed
  here**: "Upgrading mid-cycle charges the difference... downgrading
  applies at the next renewal" had no backing code at all —
  `PayPalBillingService` only revises seat *quantity*, never plan-tier
  proration. Reviewed with the founder and **removed**, same reasoning as
  the refund entry: don't promise billing behavior that isn't built.

**Still genuinely open**, and larger than a copy fix: `/product/quality`
doesn't exist as a page at all (only `/product/score` and
`/product/visibility` are built under `src/app/product/`), so its FAQ
answer ("how many pages can I audit at once?") has nowhere to go until that
page itself is built.

Filled in an earlier session (previously placeholders, now real): the
Calendly URL, the `/how-it-works` calibration numbers (previously withheld
as premature, now published directly — see the page-inventory table above),
and two home-page items that were removed rather than filled — the "share
of AI-assisted content" stat (replaced with a non-numeric, defensible
claim: "Everyone sounds the same") and the social-proof logo strip +
customer quote (deleted outright — founder explicitly said no fabricated
social proof, and there was nothing real to put there yet).

---

## Running it locally

**Frontend**: `npm run dev` (needs Node ≥20.9 — the system default is 18, use
`PATH="/opt/homebrew/opt/node@20/bin:$PATH"` or equivalent). `.env.local` already
has `NEXT_PUBLIC_API_URL=http://localhost:8080` and `NEXT_PUBLIC_DEV_BYPASS_AUTH=true`.

**Backend**: needs Postgres + Redis. The project already has `titer-pg` /
`titer-redis` Docker containers (start Docker Desktop, `docker start titer-pg
titer-redis`). Then `set -a && source .env.local && set +a && mvn spring-boot:run`
from `titer-backend/`. Flyway migrates automatically on boot.

**Production build** (for Lighthouse or a real prod check): `npm run build &&
PORT=3001 npm run start` — separate port so it doesn't collide with the dev server.
