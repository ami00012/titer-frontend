import Link from "next/link";
import { BuildingIcon, GlobeIcon, BotIcon, DatabaseIcon, PlugIcon, CpuIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AssetCard } from "@/components/marketplace/asset-card";
import { ListingAnimation, VerifyMatchAnimation, BrokerDealAnimation } from "@/components/marketing/how-it-works-animation";
import { prisma } from "@/lib/db";
import { BRAND_TAGLINE } from "@/lib/brand";

const CATEGORIES = [
  { href: "/marketplace/digital-business", label: "Digital Businesses", icon: BuildingIcon },
  { href: "/marketplace/domain", label: "Domains", icon: GlobeIcon },
  { href: "/marketplace/ai-agent", label: "AI Agents", icon: BotIcon },
  { href: "/marketplace/dataset", label: "Datasets", icon: DatabaseIcon },
  { href: "/marketplace/api", label: "APIs", icon: PlugIcon },
  { href: "/marketplace/compute", label: "Compute", icon: CpuIcon },
];

const HOW_IT_WORKS = [
  { title: "List or search", body: "Sellers list a business, domain, agent, dataset, API, or compute pool. Buyers search or describe what they want.", Animation: ListingAnimation },
  { title: "We verify and match", body: "Claims get reviewed before a listing goes live. Buyer requests are matched against published assets.", Animation: VerifyMatchAnimation },
  { title: "We broker the deal", body: "Offers, counters, and acceptance happen on-platform. We facilitate the transaction and take a commission on close.", Animation: BrokerDealAnimation },
];

export default async function HomePage() {
  const [featured, recent] = await Promise.all([
    prisma.asset.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { verificationSummary: "desc" },
      take: 6,
    }),
    prisma.asset.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  return (
    <div className="flex flex-col gap-24 pb-24">
      <section className="flex flex-col items-center gap-6 px-4 pt-20 pb-12 text-center sm:px-6">
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
          The Exchange for the AI Economy
        </h1>
        <p className="max-w-xl text-lg text-secondary-foreground">{BRAND_TAGLINE} Buy, sell and rent digital assets, AI businesses, agents, data and compute.</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/marketplace" className={buttonVariants({ size: "lg" })}>
            Explore Assets
          </Link>
          <Link href="/sell" className={buttonVariants({ variant: "outline", size: "lg" })}>
            Sell an Asset
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {CATEGORIES.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-2 rounded-lg border border-border p-4 text-center transition-colors hover:bg-muted"
            >
              <Icon className="size-6" />
              <span className="text-sm font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="text-2xl font-semibold">Featured listings</h2>
            <Link href="/marketplace" className="text-sm font-medium hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        </section>
      )}

      {recent.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <h2 className="mb-6 text-2xl font-semibold">Recently listed</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <h2 className="mb-6 text-2xl font-semibold">How it works</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {HOW_IT_WORKS.map((step, i) => (
            <Card key={step.title} className="overflow-hidden">
              <step.Animation />
              <CardContent className="flex flex-col gap-2 border-t border-border pt-4">
                <span className="text-sm font-medium text-muted-foreground">Step {i + 1}</span>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-secondary-foreground">{step.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 sm:grid-cols-2 sm:px-6">
        <Card>
          <CardContent className="flex flex-col items-start gap-3">
            <h3 className="text-xl font-semibold">Selling an asset?</h3>
            <p className="text-sm text-secondary-foreground">
              List your business, domain, agent, dataset, API, or compute pool and reach vetted buyers.
            </p>
            <Link href="/sell" className={buttonVariants()}>
              Sell an Asset
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-start gap-3">
            <h3 className="text-xl font-semibold">Looking to buy?</h3>
            <p className="text-sm text-secondary-foreground">
              Browse the marketplace, or tell us what you&apos;re looking for and we&apos;ll match you.
            </p>
            <Link href="/buy" className={buttonVariants({ variant: "outline" })}>
              Describe What You Want
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
