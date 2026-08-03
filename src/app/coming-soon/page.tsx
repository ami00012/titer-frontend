import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { LiveDemoAnimation } from "@/components/marketing/live-demo-animation";
import { WaitlistForm } from "@/components/marketing/waitlist-form";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Titer — coming soon",
  description:
    "The measurement instrument for content: emotional tone, compliance risk, and AI-answer visibility, all from one paste. Join the waitlist.",
};

export default function ComingSoonPage() {
  return (
    <main className="mx-auto flex w-full max-w-[1180px] flex-1 flex-col items-center px-6">
      <div className="flex flex-col items-center gap-4 pt-16 pb-4 text-center">
        <span className="text-lg font-semibold text-[color:var(--titer-ink)]">Titer</span>
        <Badge variant="secondary">Coming soon</Badge>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-[color:var(--titer-ink)] sm:text-5xl">
          Measure what&apos;s in your content — before it costs you.
        </h1>
        <p className="max-w-xl text-lg text-[color:var(--titer-muted)]">
          One instrument. Emotional tone, compliance risk, and how often AI answers cite you — all
          from a single paste, with the evidence behind every score.
        </p>
      </div>

      <div className="flex flex-col items-center gap-8 py-12">
        <LiveDemoAnimation />
        <div className="flex flex-col items-center gap-2">
          <WaitlistForm />
          <p className="text-xs text-[color:var(--titer-muted)]">
            No spam — just one email when we open up.
          </p>
        </div>
      </div>

      <footer className="w-full border-t border-[color:var(--titer-border)] py-8 text-center">
        <span className="text-sm text-[color:var(--titer-muted)]">© {new Date().getFullYear()} Titer</span>
      </footer>
    </main>
  );
}
