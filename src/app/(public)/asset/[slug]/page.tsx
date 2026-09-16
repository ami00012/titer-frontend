import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AssetCard } from "@/components/marketplace/asset-card";
import { AssetActions } from "@/components/marketplace/asset-actions";
import { formatMoney, VERIFICATION_LABELS } from "@/lib/format";
import { ASSET_TYPE_LABELS, type AssetTypeValue } from "@/lib/validation/asset";

async function getAsset(slug: string) {
  return prisma.asset.findUnique({
    where: { slug },
    include: { verifications: { where: { status: "APPROVED" } } },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const asset = await getAsset(slug);
  if (!asset) return {};

  const price = formatMoney(asset.price?.toString(), asset.currency);
  const mrr = formatMoney(asset.monthlyRevenue?.toString(), asset.currency);
  const title = mrr ? `${asset.title} — ${mrr} MRR` : price ? `${asset.title} — ${price}` : asset.title;

  return {
    title,
    description: asset.description.slice(0, 155),
    openGraph: { title, description: asset.description.slice(0, 155) },
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
    }),
  ]);

  const price = formatMoney(asset.price?.toString(), asset.currency);
  const metadata = (asset.metadata as Record<string, unknown>) ?? {};

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-3">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {ASSET_TYPE_LABELS[asset.assetType as AssetTypeValue]}
        </span>
        <h1 className="text-3xl font-semibold text-balance">{asset.title}</h1>
        {price && <div className="text-2xl font-semibold">{price}</div>}
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
        <AssetActions assetId={asset.id} slug={asset.slug} isAuthenticated={!!user} isOwnListing={user?.id === asset.sellerId} />
      </div>

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
        <MetadataList metadata={metadata} keys={["url", "urlOrApi", "endpoint", "domain", "registrar", "region", "availability"]} />
      </Section>

      {typeof metadata.reasonForSelling === "string" && metadata.reasonForSelling && (
        <Section title="Reason for sale">
          <p className="text-secondary-foreground">{metadata.reasonForSelling}</p>
        </Section>
      )}

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
