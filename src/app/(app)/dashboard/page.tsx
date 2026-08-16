"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { GaugeIcon, ShieldCheckIcon, EyeIcon, GlobeIcon, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { TiterDial } from "@/components/titer/titer-dial";
import { ScoreQuotaMeter } from "@/components/titer/score-quota-meter";
import { listScans } from "@/lib/api/score";

type Feature = {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  steps: string[];
};

const FEATURES: Feature[] = [
  {
    href: "/measure",
    title: "Measure",
    description:
      "Score any piece of content on emotional tone, or any dimension you type yourself -- sarcasm, urgency, empathy.",
    icon: GaugeIcon,
    steps: ["Paste text, a URL, or upload a video", "Pick a dimension (or use the default)", "Get a 0-100 score plus specific, quotable findings"],
  },
  {
    href: "/compliance",
    title: "Compliance",
    description:
      "Check content against a policy -- FTC disclosure, financial promotions, GDPR, and more -- with an auditor-ready record of every decision.",
    icon: ShieldCheckIcon,
    steps: ["Start from a built-in regulation pack", "Paste the content to check", "Titer flags for human review -- you make the call"],
  },
  {
    href: "/visibility",
    title: "Visibility",
    description:
      "Ask Claude your customers' real questions and see whether your brand comes up in the answer -- and how it's characterized.",
    icon: EyeIcon,
    steps: ["Track your brand (or a competitor)", "Add the questions real customers ask", "See if you're mentioned, cited, and how"],
  },
  {
    href: "/quality",
    title: "Quality",
    description: "Audit a whole site page by page: broken links, thin content, whether AI crawlers can even read it.",
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
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold">Overview</h1>
      <ScoreQuotaMeter />
      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Titer Score</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-2">
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
          <CardHeader>
            <CardTitle>Titer Visibility</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-2">
            <TiterDial
              score={0}
              direction="higher-is-better"
              verdict="No brand tracked"
              size={120}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold">Get the most out of Titer</h2>
          <p className="text-sm text-secondary-foreground">
            Four ways to measure your content and act on what you find.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.href}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
                      <Icon className="size-4" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </div>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <ol className="flex flex-col gap-1.5 text-sm text-secondary-foreground">
                    {feature.steps.map((step, index) => (
                      <li key={step} className="flex gap-2">
                        <span className="text-muted-foreground">{index + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                  <Link href={feature.href} className={buttonVariants({ variant: "outline", size: "sm", className: "self-start" })}>
                    Try {feature.title} →
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
