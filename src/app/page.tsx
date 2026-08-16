import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TiterDial } from "@/components/titer/titer-dial";
import { RequestDialog } from "@/components/marketing/request-dialog";
import { LiveDemoAnimation } from "@/components/marketing/live-demo-animation";
import { LocalizedPrice } from "@/components/marketing/localized-price";

// Four pillars: MEASURE (one piece of content) / QUALITY (every page on a
// site) / AUDIT (many pieces against a policy) / WATCH (your brand in AI
// answers). Quality has its own logged-in page at /quality now, so it gets
// its own card here too. Compliance (the AUDIT pillar) is real (built
// C1-C9), but sold as an enterprise demo, not self-serve -- no anonymous
// "try it" score to fabricate, so its card leads with a demo CTA instead of
// a dial, same honest-scaffold discipline as before, just for a different
// reason now (sales model, not "doesn't exist yet"). Quality shares that
// same demo-CTA shape since it also requires login, no anonymous dial.
const TOOLS = [
  {
    name: "Titer Score",
    pillar: "Measure",
    tagline: "How strongly your text connects emotionally, with per-sentence fixes.",
    buyer: "for writers & teams",
    price: { prefix: "Free → ", amount: 12, suffix: "/mo" },
    // titer is "how emotionally resonant this reads" (100 = highly resonant) --
    // see ScoreCombiner.verdict / emotional_tone.yaml bands on the backend.
    direction: "higher-is-better" as const,
    demoScore: 92,
    // /measure is login-gated like every other scoring path (see
    // PROTECTED_PREFIXES in src/lib/supabase/middleware.ts) -- an unauthenticated
    // click lands on /login first, same as Quality's card below.
    href: "/measure",
    cta: "try" as const,
  },
  {
    name: "Titer Quality",
    pillar: "Quality",
    tagline: "Audit every page on a site against Google's quality bar, your brand voice, or your compliance policy.",
    buyer: "for SEO & content teams",
    // Not a separately-priced product -- batch/site-wide auditing
    // (PlanCatalog's batchUrlsPerJob) is a Score-plan entitlement, unlocked
    // starting on Pro. See PlanCatalog.java; no standalone Quality price exists.
    price: "Included on Score Pro+",
    // Illustrative, same as Score/Visibility's demoScore above -- not a live
    // scan (there's no anonymous entry point for a login-gated batch audit),
    // just kept visually consistent with the other three cards' dial instead
    // of leaving this card looking sparse next to them.
    direction: "higher-is-better" as const,
    demoScore: 74,
    // Straight to the real feature, same as Score/Visibility -- it's
    // login-gated (no anonymous batch-audit entry point), so an unauthenticated
    // click lands on /login first, same as clicking into any gated app page
    // from a marketing site. Linking to /pricing instead was the actual bug
    // a user flagged: a product card shouldn't redirect to a pricing table.
    href: "/quality",
    cta: "try" as const,
  },
  {
    name: "Titer Compliance",
    pillar: "Audit",
    tagline: "Check every piece against your policy — and prove you did.",
    buyer: "for compliance & regulated content",
    price: { prefix: "From ", amount: 299, suffix: "/mo" },
    cta: "demo" as const,
  },
  {
    name: "Titer Visibility",
    pillar: "Watch",
    tagline: "How often AI answers mention and cite your brand.",
    buyer: "for brand & marketing",
    price: { prefix: "From ", amount: 99, suffix: "/mo" },
    direction: "higher-is-better" as const,
    demoScore: 61,
    // Visibility is demo-led, not self-serve (see the "Book a demo leads"
    // note on /product/visibility's own page) -- cta stays "demo" even
    // though it keeps a dial like Score/Quality for visual consistency
    // across the row. A "Try it" button here would promise something
    // self-serve that doesn't exist yet.
    cta: "demo" as const,
  },
];

const WHY_NOW = [
  {
    label: "The flood",
    claim: "Everyone sounds the same",
    body: "A handful of AI writing tools now produce a large share of what gets published, and they default to the same phrases and the same rhythm. The pages that don't sound like everyone else's are the ones that hold attention.",
  },
  {
    label: "The shift",
    claim: "Answers, not links",
    body: "ChatGPT, Perplexity, and Google's AI Overviews summarize pages instead of sending clicks. What they say about a brand now matters as much as where it ranks.",
  },
  {
    label: "The tell",
    claim: "Warm words aren't warmth",
    body: "\"We truly value you\" shows up in copy whether or not anyone means it. Titer scores the substance behind the language, not just whether the language sounds nice.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Paste, link, or upload",
    body: "Text, a URL, or a video — Titer reads it the way a reader would.",
  },
  {
    step: "2",
    title: "Measured against calibrated dimensions",
    body: "Emotional tone by default, or name your own X: empathy, sarcasm, brand voice.",
  },
  {
    step: "3",
    title: "Get a score and the findings behind it",
    body: "Every number traces to specific sentences, not a black box.",
  },
];

const DIMENSIONS = ["Emotional tone", "Empathy", "Urgency", "Salesiness", "Brand voice"];

const SEGMENTS = [
  {
    audience: "SEO agencies",
    reason: "Audit every client page for generic, flat content before Google does — same engine as Score, run across a whole site.",
    cta: "See Titer Score",
    href: "/product/score",
  },
  {
    audience: "Brand & marketing",
    reason: "See what AI says about your brand — and where it's wrong.",
    cta: "See Titer Visibility",
    href: "/product/visibility",
  },
  {
    audience: "Content teams",
    reason: "Block publish when a score crosses your house line.",
    cta: "Try the scanner",
    href: "/measure",
  },
];

export const dynamic = "force-static";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Titer",
            url: "https://titer.dev",
            description:
              "The measurement instrument for content: Titer Score, Titer Compliance, and Titer Visibility.",
          }),
        }}
      />
      <header className="mx-auto flex w-full max-w-[1180px] items-center justify-between px-6 py-6">
        <span className="text-lg font-semibold text-[color:var(--titer-ink)]">Titer</span>
        <nav className="flex items-center gap-3">
          <Button variant="ghost" nativeButton={false} render={<Link href="/login" />}>
            Log in
          </Button>
          <RequestDialog
            mode="demo"
            trigger={<Button className="rounded-full">Book a demo</Button>}
          />
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-[1180px] flex-1 flex-col items-center px-6">
        <div className="flex flex-col items-center gap-6 py-20 text-center">
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-[color:var(--titer-ink)] sm:text-5xl">
            Measure what&apos;s in your content — before it costs you.
          </h1>
          <p className="max-w-xl text-lg text-[color:var(--titer-muted)]">
            One instrument. Point it at any text, name what you need to know,
            get a calibrated score with the evidence behind it.
          </p>
          <div className="pt-4">
            <LiveDemoAnimation />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <RequestDialog
              mode="demo"
              trigger={<Button size="lg" className="rounded-full">Book a demo</Button>}
            />
          </div>
        </div>

        <div className="grid w-full gap-6 pb-16 sm:grid-cols-2 lg:grid-cols-4">
          {TOOLS.map((tool) => (
            <Card
              key={tool.name}
              className="flex flex-col gap-4 border-[color:var(--titer-border)] py-8 shadow-[0_2px_10px_rgba(17,19,24,0.06)] transition-shadow hover:shadow-[0_8px_24px_rgba(17,19,24,0.10)]"
            >
              <CardHeader className="items-center text-center">
                <span className="text-xs font-medium tracking-wide text-[color:var(--titer-muted)] uppercase">
                  {tool.pillar}
                </span>
                <CardTitle className="text-[color:var(--titer-ink)]">{tool.name}</CardTitle>
                <CardDescription className="text-[color:var(--titer-muted)]">
                  {tool.tagline}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col items-center gap-4">
                {/* Dial vs. badge tracks whether there's an illustrative score at all,
                    independent of cta -- Visibility keeps its dial for visual parity
                    with Score/Quality even though its cta is "demo", not "try". */}
                {tool.demoScore !== undefined ? (
                  <TiterDial score={tool.demoScore} direction={tool.direction} size={120} />
                ) : (
                  <Badge variant="secondary">Enterprise</Badge>
                )}
                {/* Pinned to the bottom of the (flex-1) card regardless of how tall the
                    dial/badge above it is, so all four buttons in the row line up. */}
                <div className="mt-auto flex flex-col items-center gap-4">
                  <span className="text-sm text-[color:var(--titer-muted)]">
                    {typeof tool.price === "string" ? tool.price : <LocalizedPrice {...tool.price} />}
                  </span>
                  <span className="text-sm text-[color:var(--titer-muted)]">{tool.buyer}</span>
                  {tool.cta === "demo" ? (
                    <RequestDialog
                      mode="demo"
                      trigger={
                        <Button variant="outline" className="rounded-full">
                          Book a demo
                        </Button>
                      }
                    />
                  ) : (
                    <Button
                      variant="outline"
                      nativeButton={false}
                      render={<Link href={tool.href} />}
                      className="rounded-full"
                    >
                      Try it
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Why now */}
        <section className="w-full border-t border-[color:var(--titer-border)] py-24">
          <div className="grid gap-10 sm:grid-cols-3">
            {WHY_NOW.map((item) => (
              <div key={item.label} className="flex flex-col gap-2 text-left">
                <span className="text-sm text-[color:var(--titer-muted)]">{item.label}</span>
                <span className="text-xl font-semibold text-[color:var(--titer-ink)]">
                  {item.claim}
                </span>
                <p className="text-[color:var(--titer-muted)]" style={{ lineHeight: 1.6 }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="w-full border-t border-[color:var(--titer-border)] py-24">
          <div className="grid gap-12 sm:grid-cols-2">
            <div className="flex flex-col gap-10 text-left">
              {HOW_IT_WORKS.map((item) => (
                <div key={item.step} className="flex gap-4">
                  <span className="text-sm text-[color:var(--titer-muted)]">{item.step}</span>
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-[color:var(--titer-ink)]">{item.title}</span>
                    <p className="text-[color:var(--titer-muted)]" style={{ lineHeight: 1.6 }}>
                      {item.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Static example -- not a live scan, illustrates what the component
                breakdown looks like for text that sounds warm but isn't. */}
            <Card className="flex flex-col gap-6 border-[color:var(--titer-border)] p-6 text-left">
              <p className="text-[color:var(--titer-muted)]" style={{ lineHeight: 1.7 }}>
                &quot;At Acme, we truly{" "}
                <span
                  className="underline decoration-2 underline-offset-4"
                  style={{ textDecorationColor: "var(--status-critical)" }}
                >
                  care about every customer&apos;s journey
                </span>
                . Your satisfaction is our{" "}
                <span
                  className="underline decoration-2 underline-offset-4"
                  style={{ textDecorationColor: "var(--status-warning)" }}
                >
                  top priority
                </span>
                .&quot;
              </p>
              <div className="flex flex-col gap-2 text-sm">
                <span className="flex items-center gap-2">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: "var(--status-critical)" }}
                    aria-hidden="true"
                  />
                  <span className="text-[color:var(--titer-ink)]">Warmth: 18 — no named stakes</span>
                </span>
                <span className="flex items-center gap-2">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: "var(--status-warning)" }}
                    aria-hidden="true"
                  />
                  <span className="text-[color:var(--titer-ink)]">Trust: 12 — generic, interchangeable claim</span>
                </span>
              </div>
              <TiterDial
                score={16}
                direction="higher-is-better"
                verdict="reserved, low emotional signal"
                size={88}
                className="self-start"
              />
            </Card>
          </div>
        </section>

        {/* Measure anything */}
        <section className="w-full border-t border-[color:var(--titer-border)] py-24 text-left">
          <h2 className="text-2xl font-semibold text-[color:var(--titer-ink)]">Measure anything</h2>
          <p className="mt-2 max-w-xl text-[color:var(--titer-muted)]" style={{ lineHeight: 1.6 }}>
            Emotional tone is the default. Name any dimension and Titer scores against it.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {DIMENSIONS.map((dim) => (
              <span
                key={dim}
                className="rounded-full border border-[color:var(--titer-border)] px-3 py-1 text-sm text-[color:var(--titer-ink)]"
              >
                {dim}
              </span>
            ))}
            <Link
              href="/measure"
              className="rounded-full border border-[color:var(--titer-border)] px-3 py-1 text-sm text-[color:var(--titer-ink)] hover:underline"
            >
              Type your own X →
            </Link>
          </div>
        </section>

        {/* Segment reasons */}
        <section className="w-full border-t border-[color:var(--titer-border)] py-24">
          <div className="grid gap-6 sm:grid-cols-3">
            {SEGMENTS.map((segment) => (
              <div
                key={segment.audience}
                className="flex flex-col gap-3 rounded-2xl border border-[color:var(--titer-border)] p-6 text-left"
              >
                <span className="text-sm text-[color:var(--titer-muted)]">{segment.audience}</span>
                <p className="text-[color:var(--titer-ink)]" style={{ lineHeight: 1.5 }}>
                  {segment.reason}
                </p>
                <Link
                  href={segment.href}
                  className="text-sm text-[color:var(--titer-ink)] underline underline-offset-2"
                >
                  {segment.cta} →
                </Link>
              </div>
            ))}

            {/* Support & CX has no live /api page yet, so its CTA opens the
                trial request instead of pointing at a route that doesn't exist. */}
            <div className="flex flex-col gap-3 rounded-2xl border border-[color:var(--titer-border)] p-6 text-left">
              <span className="text-sm text-[color:var(--titer-muted)]">Support & CX</span>
              <p className="text-[color:var(--titer-ink)]" style={{ lineHeight: 1.5 }}>
                Score every AI-drafted reply for tone before it sends.
              </p>
              <RequestDialog
                mode="trial"
                trigger={
                  <Button
                    variant="link"
                    className="h-auto justify-start p-0 text-sm text-[color:var(--titer-ink)] underline underline-offset-2"
                  >
                    Request trial →
                  </Button>
                }
              />
            </div>
          </div>
        </section>

        {/* Trust */}
        <section className="w-full border-t border-[color:var(--titer-border)] py-24 text-center">
          <p
            className="mx-auto max-w-2xl text-xl font-semibold text-[color:var(--titer-ink)]"
            style={{ lineHeight: 1.5 }}
          >
            Titer measures patterns, not authorship. Every score traces to specific
            findings — built for human review and refinement.
          </p>
        </section>

        {/* Final CTA */}
        <section className="flex w-full flex-col items-center gap-4 border-t border-[color:var(--titer-border)] py-24 text-center">
          <h2 className="text-2xl font-semibold text-[color:var(--titer-ink)]">
            See your Titer score
          </h2>
          <div className="flex gap-3">
            <Button size="lg" nativeButton={false} render={<Link href="/measure" />}>
              Check your Titer Score — free
            </Button>
            <RequestDialog
              mode="trial"
              trigger={
                <Button size="lg" variant="outline" className="rounded-full">
                  Request trial
                </Button>
              }
            />
          </div>
        </section>
      </main>

      {/* Footer -- intentionally minimal: only links to routes that exist today.
          Solutions/Blog/Research/Docs/Legal columns land as those pages ship. */}
      <footer className="w-full border-t border-[color:var(--titer-border)]">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6 px-6 py-12 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-[color:var(--titer-muted)]">
            © {new Date().getFullYear()} Titer
          </span>
          <div className="flex flex-wrap items-center gap-6 text-sm text-[color:var(--titer-muted)]">
            <Link href="/measure" className="hover:text-[color:var(--titer-ink)] hover:underline">
              Score
            </Link>
            <Link href="/visibility" className="hover:text-[color:var(--titer-ink)] hover:underline">
              Visibility
            </Link>
            <RequestDialog
              mode="demo"
              trigger={
                <Button
                  variant="link"
                  className="h-auto p-0 text-sm text-[color:var(--titer-muted)] hover:text-[color:var(--titer-ink)]"
                >
                  Book a demo
                </Button>
              }
            />
          </div>
        </div>
      </footer>
    </div>
  );
}
