import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RequestDialog } from "@/components/marketing/request-dialog";
import { ToolPageTemplate } from "@/components/marketing/tool-page-template";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Titer Visibility — how often AI answers mention and cite your brand",
  description:
    "Track what Claude says about your brand, and catch it when it gets a fact wrong. More engines as real API access opens up.",
};

const REASONS = [
  "See which AI engines mention your brand, and how often.",
  "Catch wrong prices, dead features, and outdated claims before a buyer does.",
  "Compare your presence against named competitors.",
];

const WHO = [
  "Brand and marketing leads who own how the company is represented.",
  "Founders who've noticed AI answers getting facts wrong.",
  "Teams competing on being the cited source, not just the top link.",
];

const FAQ = [
  {
    q: "Which AI engines do you track?",
    a: "Claude today — the only engine with a real, working integration. ChatGPT and Perplexity are next once "
      + "API access is in place; Google AI Overviews has no public API at all, so it may never be directly "
      + "trackable this way.",
  },
  {
    q: "How do you catch wrong facts?",
    a: "Titer asks Claude your customers' real questions and flags anything in the answer that looks factually "
      + "off about your brand. Runs on demand today; scheduled/recurring checks are on the roadmap.",
  },
  {
    q: "Is this the same as social media monitoring?",
    a: "No — Visibility only tracks what AI engines say, not social mentions.",
  },
  {
    q: "Why does this push toward a demo?",
    a: "Setup means telling Titer the facts to check your brand against, so we walk through it live rather than leave it self-serve.",
  },
];

/**
 * Shaped like the real product (mentioned/cited/position/sentiment,
 * accuracy flags), not a hypothetical multi-engine dashboard -- Claude is
 * the one engine actually wired up today, see the FAQ answer above.
 */
function VisibilityExample() {
  return (
    <div className="flex flex-col gap-4 sm:max-w-xl">
      <Card className="flex flex-col gap-3 border-[color:var(--titer-border)] p-4">
        <p className="text-sm text-[color:var(--titer-muted)]">Asked Claude:</p>
        <p className="text-[color:var(--titer-ink)]">&quot;What&apos;s a good tool for tracking team OKRs?&quot;</p>
        <div className="flex flex-wrap items-center gap-2 pt-1 text-sm">
          <span className="rounded-full bg-[color:var(--status-good)]/15 px-2.5 py-1 text-[color:var(--titer-ink)]">
            Mentioned
          </span>
          <span className="rounded-full bg-[color:var(--status-good)]/15 px-2.5 py-1 text-[color:var(--titer-ink)]">
            Cited
          </span>
          <span className="rounded-full border border-[color:var(--titer-border)] px-2.5 py-1 text-[color:var(--titer-muted)]">
            Position 2
          </span>
          <span className="rounded-full border border-[color:var(--titer-border)] px-2.5 py-1 text-[color:var(--titer-muted)]">
            Neutral
          </span>
        </div>
      </Card>

      <div
        className="rounded-lg border border-[color:var(--titer-border)] p-4"
        style={{ borderLeft: "3px solid var(--status-critical)" }}
      >
        <span className="flex items-center gap-2 text-sm">
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: "var(--status-critical)" }}
            aria-hidden="true"
          />
          <span className="font-semibold text-[color:var(--titer-ink)]">Accuracy flag</span>
        </span>
        <p className="mt-1 text-[color:var(--titer-ink)]">
          The answer describes a feature your product doesn&apos;t actually have.
        </p>
      </div>
    </div>
  );
}

export default function VisibilityPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: "Titer Visibility",
            description:
              "Tracks how often AI answers mention and cite a brand, and flags when they get the facts wrong.",
            brand: { "@type": "Brand", name: "Titer" },
            offers: { "@type": "Offer", priceCurrency: "USD", price: "99" },
          }),
        }}
      />
      {/*
        NOTE: this is the one page where "Book a demo" leads over "Request
        trial" (primary ink pill vs. outline) -- highest price, least
        self-serve tool, and the per-tool spec calls this out explicitly.
        Every other marketing page keeps Request trial as the site-wide
        primary CTA.
      */}
      <ToolPageTemplate
        name="Titer Visibility"
        heroTagline="How often AI answers mention and cite your brand — and whether they get it right."
        dial={{ score: 61, direction: "higher-is-better" }}
        heroPrimary={
          <RequestDialog mode="demo" trigger={<Button size="lg">Book a demo</Button>} />
        }
        heroSecondary={
          <RequestDialog
            mode="trial"
            trigger={
              <Button size="lg" variant="outline" className="rounded-full">
                Request trial
              </Button>
            }
          />
        }
        problem="Buyers ask ChatGPT and Google's AI answers about a brand before they ever visit its site — and those answers can be outdated, incomplete, or simply wrong. Most marketing teams have no way to see what's being said, let alone correct it."
        howItWorksTitle="See what each engine says"
        howItWorksVisual={<VisibilityExample />}
        reasons={REASONS}
        whoItsFor={WHO}
        pricing={{ price: { prefix: "From ", amount: 99, suffix: "/mo" }, note: "Priced by brand and competitors tracked." }}
        faq={FAQ}
        closingPrimary={
          <RequestDialog mode="demo" trigger={<Button size="lg">Book a demo</Button>} />
        }
        closingSecondary={
          <RequestDialog
            mode="trial"
            trigger={
              <Button size="lg" variant="outline" className="rounded-full">
                Request trial
              </Button>
            }
          />
        }
      />
    </>
  );
}
