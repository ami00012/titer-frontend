import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RequestDialog } from "@/components/marketing/request-dialog";
import { ToolPageTemplate } from "@/components/marketing/tool-page-template";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Titer Visibility — how often AI answers mention and cite your brand",
  description:
    "Track what ChatGPT, Perplexity, Google AI Overviews, and Gemini say about your brand, and catch it when they get a fact wrong.",
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
    a: "ChatGPT, Perplexity, Google AI Overviews, and Gemini today, with more added as they matter.",
  },
  {
    q: "How do you catch wrong facts?",
    a: "Titer asks each engine about your brand on a schedule and flags answers that don't match the facts you give it.",
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

type Status = "good" | "warning" | "critical" | "none";

const CHANNELS: { name: string; status: Status; label: string }[] = [
  { name: "ChatGPT", status: "good", label: "Mentioned accurately" },
  { name: "Perplexity", status: "warning", label: "Mentioned, price outdated" },
  { name: "Google AI Overviews", status: "good", label: "Mentioned accurately" },
  { name: "Gemini", status: "critical", label: "Mentioned, price wrong" },
  { name: "YouTube", status: "none", label: "Not mentioned" },
];

const STATUS_VAR: Record<Exclude<Status, "none">, string> = {
  good: "--status-good",
  warning: "--status-warning",
  critical: "--status-critical",
};

function VisibilityExample() {
  return (
    <div className="flex flex-col gap-6 sm:max-w-xl">
      <Card className="flex flex-col border-[color:var(--titer-border)] p-0">
        {CHANNELS.map((channel) => (
          <div
            key={channel.name}
            className="flex items-center justify-between border-b border-[color:var(--titer-border)] px-4 py-3 last:border-b-0"
          >
            <span className="text-[color:var(--titer-ink)]">{channel.name}</span>
            <span className="flex items-center gap-2 text-sm text-[color:var(--titer-muted)]">
              {channel.status !== "none" ? (
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: `var(${STATUS_VAR[channel.status]})` }}
                  aria-hidden="true"
                />
              ) : null}
              {channel.label}
            </span>
          </div>
        ))}
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
          <span className="font-semibold text-[color:var(--titer-ink)]">Inaccurate</span>
        </span>
        <p className="mt-1 text-[color:var(--titer-ink)]">
          Gemini says your price is $99 — it&apos;s $49.
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
        pricing={{ price: "From $99/mo", note: "Priced by brand and competitors tracked." }}
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
