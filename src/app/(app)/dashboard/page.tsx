"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { TiterDial } from "@/components/titer/titer-dial";
import { ScoreQuotaMeter } from "@/components/titer/score-quota-meter";
import { listScans } from "@/lib/api/score";

type Feature = {
  href: string;
  title: string;
  description: string;
  gif: string | null;
};

const FEATURES: Feature[] = [
  {
    href: "/measure",
    title: "Measure",
    description:
      "Paste text, a URL, or upload a video. Get a 0-100 score plus specific, quotable findings on any dimension -- emotional tone by default, or type your own: sarcasm, urgency, empathy.",
    gif: "/demos/measure.gif",
  },
  {
    href: "/compliance",
    title: "Compliance",
    description:
      "Check content against a policy -- FTC disclosure, financial promotions, GDPR, and more -- and keep an auditor-ready record of every decision. Titer flags for human review; a qualified person makes the call.",
    gif: "/demos/compliance.gif",
  },
  {
    href: "/visibility",
    title: "Visibility",
    description:
      "Ask Claude your customers' real questions and see whether your brand comes up in the answer -- and how it's characterized when it does.",
    gif: null,
  },
  {
    href: "/quality",
    title: "Quality",
    description:
      "Audit a whole site page by page: broken links, thin content, whether AI crawlers can even read it.",
    gif: null,
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
          {FEATURES.map((feature) => (
            <Card key={feature.href}>
              {feature.gif ? (
                // eslint-disable-next-line @next/next/no-img-element -- animated GIF; next/image strips animation unless unoptimized.
                <img src={feature.gif} alt={`${feature.title} walkthrough`} className="w-full" />
              ) : (
                <div className="flex h-[157px] items-center justify-center bg-muted/40 text-sm text-muted-foreground">
                  {feature.title}
                </div>
              )}
              <CardHeader>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={feature.href} className={buttonVariants({ variant: "outline", size: "sm" })}>
                  Try {feature.title} →
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
