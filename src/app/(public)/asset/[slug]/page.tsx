import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { AssetCard } from "@/components/marketplace/asset-card";
import { AssetActions } from "@/components/marketplace/asset-actions";
import { TiterScoreBadge } from "@/components/marketplace/titer-score-badge";
import { OpenBidCard } from "@/components/marketplace/open-bid-card";
import { formatMoney, VERIFICATION_LABELS } from "@/lib/format";
import { ASSET_TYPE_LABELS, type AssetTypeValue } from "@/lib/validation/asset";
import { TITER_SCORE_COMPONENTS } from "@/lib/titer-score";

// Confidential listings hide name/URL/screenshots but stay fully public and
// indexed with metrics, score, model risk, and proof of function (§2.4) --
// these are the metadata.* keys that can leak an identity, so they're the
// only ones stripped from the rendered Operations section.
const IDENTITY_LEAKING_METADATA_KEYS = ["url", "urlOrApi", "endpoint", "documentationUrl", "domain"];

async function getAsset(slug: string) {
  return prisma.asset.findUnique({
    where: { slug },
    include: {
      verifications: { where: { status: "APPROVED" } },
      titerScore: true,
      proofRuns: { orderBy: { ranAt: "desc" }, take: 1 },
      bidWindow: {
        select: {
          id: true,
          opensAt: true,
          closesAt: true,
          status: true,
          bids: { select: { amount: true }, orderBy: { amount: "desc" }, take: 1 },
          _count: { select: { bids: true } },
        },
      },
    },
  });
}

function displayTitle(asset: { title: string; confidential: boolean; assetType: string }) {
  return asset.confidential
    ? `${ASSET_TYPE_LABELS[asset.assetType as AssetTypeValue]} — Confidential Listing`
    : asset.title;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const asset = await getAsset(slug);
  if (!asset) return {};

  const title = displayTitle(asset);
  const price = formatMoney(asset.price?.toString(), asset.currency);
  const mrr = formatMoney(asset.monthlyRevenue?.toString(), asset.currency);
  const pageTitle = asset.confidential ? title : mrr ? `${title} — ${mrr} MRR` : price ? `${title} — ${price}` : title;
  const description = asset.confidential
    ? `${ASSET_TYPE_LABELS[asset.assetType as AssetTypeValue]} listing scored by Titer. Name and URL withheld at the seller's request.`
    : asset.description.slice(0, 155);

  return {
    title: pageTitle,
    description,
    openGraph: { title: pageTitle, description },
  };
}

export default async function AssetDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const asset = await getAsset(slug);
  if (!asset || asset.status === "DRAFT") notFound();

  const [user, similar] = await Promise.all([
    getCurrentUser().catch(() => null),
    prisma.asset.findMany({
      where: { assetType: asset.assetType, status: "PUBLISHED", id: { not: asset.id } },
      take: 3,
      include: { titerScore: true },
    }),
  ]);

  const price = formatMoney(asset.price?.toString(), asset.currency);
  const metadata = (asset.metadata as Record<string, unknown>) ?? {};
  const title = displayTitle(asset);

  const annualRevenue = asset.revenue ? Number(asset.revenue) : asset.monthlyRevenue ? Number(asset.monthlyRevenue) * 12 : null;
  const multiple = asset.price && annualRevenue ? Number(asset.price) / annualRevenue : null;

  const showModelRisk = asset.assetType === "AI_AGENT" || asset.inferenceCostPctOfRevenue !== null;
  const latestProofRun = asset.proofRuns[0] ?? null;
  const categorySlug = asset.assetType.toLowerCase().replace(/_/g, "-");

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {ASSET_TYPE_LABELS[asset.assetType as AssetTypeValue]}
          </span>
          <TiterScoreBadge total={asset.titerScore?.total} />
        </div>
        <h1 className="text-3xl font-semibold text-balance">{title}</h1>
        <div className="flex flex-wrap items-baseline gap-3">
          {price && <div className="text-2xl font-semibold">{price}</div>}
          {multiple !== null && <div className="text-sm text-secondary-foreground">{multiple.toFixed(1)}x revenue</div>}
          {asset.founderHoursPerWeek !== null && (
            <div className="text-sm text-secondary-foreground">{asset.founderHoursPerWeek} hrs/week</div>
          )}
        </div>
        {asset.confidential && (
          <p className="text-sm text-secondary-foreground">
            Name, URL, and screenshots are withheld at the seller&apos;s request. Metrics, Titer Score, and any Proof
            of Function below are unredacted.
          </p>
        )}
        {asset.verifications.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {asset.verifications.map((v) => (
              <Badge key={v.id} variant="secondary">
                ✓ {VERIFICATION_LABELS[v.type]}
              </Badge>
            ))}
          </div>
        )}
        {asset.isSeedData && <Badge variant="outline">Demo listing — not a real asset</Badge>}
      </div>

      {asset.bidWindow && asset.bidWindow.status === "OPEN" && <OpenBidCard bidWindow={asset.bidWindow} />}

      <Section title="Titer Score breakdown">
        {asset.titerScore ? (
          <Card>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <TiterScoreBadge total={asset.titerScore.total} />
                <span className="text-sm text-secondary-foreground">Rubric {asset.titerScore.rubricVersion}</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-5">
                {TITER_SCORE_COMPONENTS.map((c) => (
                  <div key={c.key} className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">{c.label}</span>
                    <span className="font-medium">
                      {asset.titerScore![c.key]}/{c.max}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-secondary-foreground">{asset.titerScore.justification}</p>
              <Link href="/methodology" className="text-sm font-medium hover:underline">
                How the score is calculated →
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="flex items-center gap-2">
            <TiterScoreBadge total={null} />
            <p className="text-sm text-secondary-foreground">This listing hasn&apos;t been scored yet.</p>
          </div>
        )}
      </Section>

      {showModelRisk && (
        <Section title="Model Risk">
          <Card>
            <CardContent className="flex flex-col gap-3">
              {asset.modelRiskVerdict && <p className="font-medium">{asset.modelRiskVerdict}</p>}
              <MetricGrid
                items={[
                  ["Primary model provider", asset.primaryModelProvider],
                  ["Fallback provider", asset.fallbackProvider],
                  ["Inference cost (% of revenue)", asset.inferenceCostPctOfRevenue ? `${asset.inferenceCostPctOfRevenue}%` : null],
                  ["Gross margin at 2x token price", asset.grossMarginAt2xTokenPrice ? `${asset.grossMarginAt2xTokenPrice}%` : null],
                  ["Moat type", asset.moatType],
                ]}
              />
              {asset.providerFeatureOverlapNotes && (
                <p className="text-sm text-secondary-foreground">{asset.providerFeatureOverlapNotes}</p>
              )}
            </CardContent>
          </Card>
        </Section>
      )}

      {latestProofRun && (
        <Section title="Proof of Function">
          <Card>
            <CardContent className="flex flex-col gap-2">
              <p className="text-sm">
                Run {latestProofRun.ranAt.toDateString()} · {latestProofRun.requestCount} requests ·{" "}
                {Number(latestProofRun.successRate)}% success · p95 {latestProofRun.p95Ms}ms · $
                {Number(latestProofRun.costPerTaskUsd)}/task
              </p>
              <Link href="/methodology#proof-of-function" className="text-sm font-medium hover:underline">
                How runs are measured →
              </Link>
            </CardContent>
          </Card>
        </Section>
      )}

      <Section title="Overview">
        <p className="whitespace-pre-wrap text-secondary-foreground">{asset.description}</p>
      </Section>

      <Section title="Financials">
        <MetricGrid
          items={[
            ["Revenue", formatMoney(asset.revenue?.toString(), asset.currency)],
            ["Monthly revenue", formatMoney(asset.monthlyRevenue?.toString(), asset.currency)],
            ["Profit", formatMoney(asset.profit?.toString(), asset.currency)],
            ["Monthly profit", formatMoney(asset.monthlyProfit?.toString(), asset.currency)],
          ]}
        />
      </Section>

      <Section title="Growth">
        <MetricGrid
          items={[
            ["Growth rate", asset.growthRate ? `${asset.growthRate}% MoM` : null],
            ["Traffic", asset.traffic?.toLocaleString() ?? null],
            ["Users", metadata.users ? String(metadata.users) : null],
          ]}
        />
      </Section>

      <Section title="Customers">
        <MetricGrid items={[["Customers", asset.customers?.toLocaleString() ?? null]]} />
      </Section>

      <Section title="Technology">
        <MetadataList metadata={metadata} keys={["techStack", "modelDependencies", "infrastructure", "gpu", "cpu", "format"]} />
      </Section>

      <Section title="Operations">
        <MetadataList
          metadata={asset.confidential ? omitKeys(metadata, IDENTITY_LEAKING_METADATA_KEYS) : metadata}
          keys={["url", "urlOrApi", "endpoint", "domain", "registrar", "region", "availability"]}
        />
      </Section>

      {typeof metadata.reasonForSelling === "string" && metadata.reasonForSelling && (
        <Section title="Reason for sale">
          <p className="text-secondary-foreground">{metadata.reasonForSelling}</p>
        </Section>
      )}

      {asset.transferChecklist && (
        <Section title="Transfer checklist">
          <p className="whitespace-pre-wrap text-secondary-foreground">{asset.transferChecklist}</p>
        </Section>
      )}

      <Section title="Comparable closes">
        <p className="text-sm text-secondary-foreground">
          See recent {ASSET_TYPE_LABELS[asset.assetType as AssetTypeValue].toLowerCase()} multiples on the Titer
          Index.
        </p>
        <Link href={`/index?type=${categorySlug}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
          View comparables →
        </Link>
      </Section>

      <Section title="Verification">
        {asset.verifications.length === 0 ? (
          <p className="text-sm text-secondary-foreground">No claims have been verified by our team yet.</p>
        ) : (
          <ul className="flex flex-col gap-1 text-sm">
            {asset.verifications.map((v) => (
              <li key={v.id} className="text-emerald-600 dark:text-emerald-400">✓ {VERIFICATION_LABELS[v.type]}</li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Seller">
        <p className="text-sm text-secondary-foreground">
          Seller details are shared once you request information or an offer is accepted — this listing is brokered, not self-serve.
        </p>
      </Section>

      <Section title="Make an offer">
        <AssetActions assetId={asset.id} slug={asset.slug} isAuthenticated={!!user} isOwnListing={user?.id === asset.sellerId} />
      </Section>

      {similar.length > 0 && (
        <Section title="Similar assets">
          <div className="grid gap-4 sm:grid-cols-3">
            {similar.map((s) => (
              <AssetCard key={s.id} asset={s} />
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function omitKeys(metadata: Record<string, unknown>, keys: string[]): Record<string, unknown> {
  const result = { ...metadata };
  for (const key of keys) delete result[key];
  return result;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 border-t border-border pt-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function MetricGrid({ items }: { items: [string, string | null | undefined][] }) {
  const visible = items.filter(([, value]) => value);
  if (visible.length === 0) return <p className="text-sm text-secondary-foreground">Not disclosed.</p>;
  return (
    <Card>
      <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {visible.map(([label, value]) => (
          <div key={label} className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="font-medium">{value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function MetadataList({ metadata, keys }: { metadata: Record<string, unknown>; keys: string[] }) {
  const entries = keys
    .filter((key) => metadata[key])
    .map((key) => [key, metadata[key]] as const);
  if (entries.length === 0) return <p className="text-sm text-secondary-foreground">Not disclosed.</p>;
  return (
    <dl className="flex flex-col gap-2 text-sm">
      {entries.map(([key, value]) => (
        <div key={key} className="flex gap-2">
          <dt className="w-40 shrink-0 text-muted-foreground">{formatKeyLabel(key)}</dt>
          <dd>{String(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

function formatKeyLabel(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}
