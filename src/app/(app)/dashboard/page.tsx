"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { GaugeIcon, ShieldCheckIcon, EyeIcon, GlobeIcon, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { TiterDial } from "@/components/titer/titer-dial";
import { ScoreQuotaMeter } from "@/components/titer/score-quota-meter";
import { listScans } from "@/lib/api/score";

type Pillar = {
  href: string;
  title: string;
  question: string;
  description: string;
  icon: LucideIcon;
  steps: string[];
};

// Four questions every piece of published content actually raises -- the
// page tells this as a story (question -> what Titer does about it), not a
// flat feature list, so a brand-new user understands *why* each pillar
// exists before they see the (empty, for them) score dials below.
const PILLARS: Pillar[] = [
  {
    href: "/measure",
    title: "Measure",
    question: "Will it land?",
    description:
      "Emotional tone by default, or any dimension you name -- sarcasm, urgency, empathy. Paste it and get a 0-100 score plus the exact lines driving that number.",
    icon: GaugeIcon,
    steps: ["Paste text, a URL, or upload a video", "Pick a dimension (or use the default)", "Get a score plus specific, quotable findings"],
  },
  {
    href: "/compliance",
    title: "Compliance",
    question: "Will it get you in trouble?",
    description:
      "FTC disclosure, financial promotions, GDPR, and more. Titer flags what a regulator would flag against your policy -- a qualified person still makes the call.",
    icon: ShieldCheckIcon,
    steps: ["Start from a built-in regulation pack", "Paste the content to check", "Review what's flagged, with an auditor-ready record"],
  },
  {
    href: "/visibility",
    title: "Visibility",
    question: "Does AI even mention you?",
    description:
      "Ask AI the real questions your customers ask, on a schedule, not one prompt at a time. See whether your brand comes up in the answer -- and how it's characterized when it does.",
    icon: EyeIcon,
    steps: ["Track your brand (or a competitor)", "Add the questions real customers ask", "See if you're mentioned, cited, and how"],
  },
  {
    href: "/quality",
    title: "Quality",
    question: "Is the site holding it back?",
    description:
      "One broken page undercuts everything you publish on the rest of the site. Titer crawls it page by page and finds what's actually wrong.",
    icon: GlobeIcon,
    steps: ["Enter a site URL", "Titer crawls it page by page", "Get a page-by-page breakdown of issues"],
  },
];

export default function DashboardPage() {
  // Most-recent-first (see ScanRepository.findByWorkspaceIdOrderByCreatedAtDesc) --
  // [0] is the latest scan, if any.
  const scansQuery = useQuery({ queryKey: ["scans"], queryFn: listScans });
  const latestScan = scansQuery.data?.[0];

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">You published it. Does it actually work?</h1>
        <p className="max-w-2xl text-secondary-foreground">
          Titer measures what&apos;s in your content -- whether it lands emotionally, whether
          it&apos;s compliant, whether AI even mentions you, and whether the site around it is
          holding it back -- so you find out before your audience does.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {PILLARS.map((pillar, index) => {
          const Icon = pillar.icon;
          const reversed = index % 2 === 1;
          return (
            <Card key={pillar.href} className="transition-colors hover:ring-foreground/20">
              <CardContent
                className={`flex flex-col gap-6 sm:items-center ${reversed ? "sm:flex-row-reverse" : "sm:flex-row"}`}
              >
                <div className="flex shrink-0 flex-col gap-3 sm:w-56">
                  <div className="flex size-10 items-center justify-center rounded-md bg-muted text-foreground ring-1 ring-border">
                    <Icon className="size-5" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-muted-foreground">{pillar.title}</span>
                    <h2 className="text-xl font-semibold text-balance">{pillar.question}</h2>
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-3">
                  <p className="text-secondary-foreground">{pillar.description}</p>
                  <ol className="flex flex-col gap-1 border-l border-border pl-3 text-sm text-secondary-foreground">
                    {pillar.steps.map((step, stepIndex) => (
                      <li key={step} className="flex gap-2">
                        <span className="text-muted-foreground">{stepIndex + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                  <Link href={pillar.href} className={buttonVariants({ variant: "outline", size: "sm", className: "self-start" })}>
                    Try {pillar.title} →
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-col gap-4 border-t border-border pt-8">
        <div>
          <h2 className="text-lg font-semibold">Your numbers</h2>
          <p className="text-sm text-secondary-foreground">
            {latestScan
              ? "Where your content stands right now."
              : "Run your first check above and your scores will show up here."}
          </p>
        </div>
        <ScoreQuotaMeter />
        <div className="grid gap-6 sm:grid-cols-2">
          <Card>
            <CardContent className="flex flex-col items-center gap-2 pt-6">
              <span className="text-sm font-medium text-muted-foreground">Titer Score</span>
              {/* higher-is-better, matching every other Score dial in the app
                  (see product/score, the homepage TOOLS card, Measure) --
                  titer is "how emotionally resonant this reads." */}
              <TiterDial
                score={latestScan?.titer ?? 0}
                direction="higher-is-better"
                verdict={latestScan ? latestScan.verdict : "No scans yet"}
                size={120}
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center gap-2 pt-6">
              <span className="text-sm font-medium text-muted-foreground">Titer Visibility</span>
              <TiterDial
                score={0}
                direction="higher-is-better"
                verdict="No brand tracked"
                size={120}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
