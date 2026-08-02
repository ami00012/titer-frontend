import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RequestDialog } from "@/components/marketing/request-dialog";
import { ToolPageTemplate } from "@/components/marketing/tool-page-template";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Titer Score — how strongly your writing connects emotionally",
  description:
    "Paste text, a URL, or a video and get a 0–100 emotional-tone score with the exact components and fixes behind it. Free, no signup.",
};

const REASONS = [
  "Catch warm-sounding copy that has nothing behind it before a reader does.",
  "Set a house standard: a tone score every draft has to clear before it publishes.",
  "Measure any custom dimension the same way — empathy, urgency, brand voice.",
];

const WHO = [
  "Writers checking a draft before it goes out.",
  "Editors setting a bar across a team.",
  "Anyone who wants a second read that shows its work.",
];

const FAQ = [
  {
    q: "Does a low score mean the writing is bad?",
    a: "No. A low score means the writing reads emotionally flat or generic — which is correct for a lot of writing, like legal notices or technical docs. Treat the score as a signal to review, not a verdict on quality.",
  },
  {
    q: "What's the score based on?",
    a: "Five components — joy, trust, urgency, confidence, and warmth — each scored by reading what's actually in the text, not a keyword match. The breakdown shows you exactly where a score is coming from.",
  },
  {
    q: "Can I measure something other than emotional tone?",
    a: "Yes. Name any dimension — empathy, urgency, brand voice — and Titer scores against it the same way.",
  },
  {
    q: "Does it work on video?",
    a: "Yes. Upload a video and Titer scores the transcript.",
  },
  {
    q: "Can I check a whole site at once?",
    a: "Yes — give Titer a sitemap or a list of URLs and it scores every page against the same dimension, worst-first, so you can see which pages need attention without checking each one by hand.",
  },
];

function ScoreExample() {
  return (
    <Card className="flex flex-col gap-6 border-[color:var(--titer-border)] p-6 text-left sm:max-w-xl">
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
      <div className="flex flex-col gap-1 text-sm">
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
      <div className="rounded-lg border border-[color:var(--titer-border)] p-3">
        <span className="text-sm text-[color:var(--titer-muted)]">Suggested fix</span>
        <p className="mt-1 text-[color:var(--titer-ink)]">
          &ldquo;When Maria&apos;s shipment got stuck at customs before her daughter&apos;s wedding,
          Priya called the courier herself every morning until it moved. That&apos;s the promise
          we&apos;re actually making.&rdquo;
        </p>
      </div>
      <span className="text-sm text-[color:var(--titer-muted)]">
        One fix shown here — unlimited fixes on Pro.
      </span>
    </Card>
  );
}

export default function ScorePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: "Titer Score",
            description:
              "Scores any text 0–100 for emotional tone, with the specific components and fixes behind the number.",
            brand: { "@type": "Brand", name: "Titer" },
            offers: {
              "@type": "AggregateOffer",
              priceCurrency: "USD",
              lowPrice: "0",
              highPrice: "12",
            },
          }),
        }}
      />
      <ToolPageTemplate
        name="Titer Score"
        heroTagline="How strongly your writing connects emotionally, broken down by component."
        dial={{ score: 92, direction: "higher-is-better" }}
        heroPrimary={
          <Button size="lg" nativeButton={false} render={<Link href="/measure" />}>
            Check your Titer Score — free
          </Button>
        }
        heroSecondary={
          <RequestDialog
            mode="demo"
            trigger={
              <Button size="lg" variant="ghost" className="text-[color:var(--titer-muted)]">
                Book a demo
              </Button>
            }
          />
        }
        problem="Writing that sounds warm doesn't always feel warm to the person reading it. A paragraph can use all the right words — 'we care,' 'trusted,' 'your success matters' — and still ring hollow because nothing behind it is specific. Titer shows you which parts of a piece are doing real emotional work and which are just borrowed vocabulary."
        howItWorksTitle="Paste text, get the breakdown"
        howItWorksVisual={<ScoreExample />}
        reasons={REASONS}
        whoItsFor={WHO}
        pricing={{ price: "Free → $12/mo", note: "Free covers occasional checks. Pro adds unlimited scans and fixes." }}
        faq={FAQ}
        closingPrimary={
          <Button size="lg" nativeButton={false} render={<Link href="/measure" />}>
            Check your Titer Score — free
          </Button>
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
