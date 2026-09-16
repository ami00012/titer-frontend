import { PrismaClient, type AssetType, type PricingType, type Prisma, type VerificationSummary } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_SELLER_ID = "00000000-0000-0000-0000-0000000000s1";
const DEMO_SELLER_EMAIL = "demo-seller@example.com";

function slugify(title: string, suffix: string) {
  return `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${suffix}`;
}

interface SeedAsset {
  title: string;
  description: string;
  assetType: AssetType;
  price: number;
  currency?: string;
  pricingType?: PricingType;
  category?: string;
  businessModel?: string;
  revenue?: number;
  monthlyRevenue?: number;
  profit?: number;
  monthlyProfit?: number;
  growthRate?: number;
  customers?: number;
  traffic?: number;
  metadata?: Record<string, unknown>;
  verificationSummary?: VerificationSummary;
}

const DIGITAL_BUSINESSES: SeedAsset[] = [
  { title: "AI Invoice SaaS", description: "Automated invoice generation and chasing for freelancers, built on GPT-4 with QuickBooks/Xero sync.", assetType: "DIGITAL_BUSINESS", price: 42000, businessModel: "B2B SaaS", revenue: 38400, monthlyRevenue: 3200, profit: 25200, monthlyProfit: 2100, growthRate: 18, customers: 210, traffic: 4200, metadata: { url: "https://example.com/invoiceai", reasonForSelling: "Founder moving to a new full-time role.", techStack: "Next.js, Postgres, OpenAI API" }, verificationSummary: "VERIFIED" },
  { title: "Newsletter Ops Agency", description: "Done-for-you newsletter writing and growth agency serving 14 B2B SaaS clients on retainer.", assetType: "DIGITAL_BUSINESS", price: 95000, businessModel: "Agency", revenue: 132000, monthlyRevenue: 11000, profit: 79200, monthlyProfit: 6600, growthRate: 6, customers: 14, metadata: { reasonForSelling: "Owner relocating abroad." }, verificationSummary: "PARTIAL" },
  { title: "Recipe Discovery App", description: "Mobile app with 60k MAU surfacing recipes from a user's pantry photo using vision models.", assetType: "DIGITAL_BUSINESS", price: 28000, businessModel: "B2C", revenue: 9600, monthlyRevenue: 800, profit: 4800, monthlyProfit: 400, growthRate: 24, customers: 60000, traffic: 60000, metadata: { url: "https://example.com/pantrypal" } },
  { title: "Shopify Returns Widget", description: "Installed on 900+ Shopify stores, automates return labels and restocking.", assetType: "DIGITAL_BUSINESS", price: 61000, businessModel: "B2B SaaS", revenue: 55200, monthlyRevenue: 4600, profit: 39000, monthlyProfit: 3250, growthRate: 11, customers: 900, metadata: { techStack: "Remix, Shopify API" }, verificationSummary: "VERIFIED" },
  { title: "Legal Doc Summarizer", description: "Browser extension + API summarizing contracts for small law firms, used by 40 firms.", assetType: "DIGITAL_BUSINESS", price: 34000, businessModel: "B2B SaaS", revenue: 21600, monthlyRevenue: 1800, profit: 14400, monthlyProfit: 1200, growthRate: 15, customers: 40 },
  { title: "Podcast Clip Generator", description: "Turns long-form podcast episodes into short-form clips automatically for creators.", assetType: "DIGITAL_BUSINESS", price: 48000, businessModel: "B2C SaaS", revenue: 30000, monthlyRevenue: 2500, profit: 18000, monthlyProfit: 1500, growthRate: 22, customers: 1100, metadata: { reasonForSelling: "Focusing on a different startup." } },
  { title: "Restaurant Review Aggregator", description: "Aggregates and summarizes reviews across platforms for 3,000 restaurants, ad-supported.", assetType: "DIGITAL_BUSINESS", price: 19000, businessModel: "Ad-supported", revenue: 14400, monthlyRevenue: 1200, profit: 7200, monthlyProfit: 600, growthRate: 4, traffic: 85000 },
  { title: "AI Resume Coach", description: "Resume rewriting and interview prep tool with a freemium model, 5k paying subscribers.", assetType: "DIGITAL_BUSINESS", price: 120000, businessModel: "B2C SaaS", revenue: 156000, monthlyRevenue: 13000, profit: 93600, monthlyProfit: 7800, growthRate: 9, customers: 5000, metadata: { url: "https://example.com/resumecoach" }, verificationSummary: "VERIFIED" },
  { title: "Micro-SaaS: Meeting Notes Bot", description: "Slack bot that joins calls and posts structured notes, self-serve, low support burden.", assetType: "DIGITAL_BUSINESS", price: 22000, businessModel: "B2B SaaS", revenue: 12000, monthlyRevenue: 1000, profit: 8400, monthlyProfit: 700, growthRate: 13, customers: 85, metadata: { reasonForSelling: "Low maintenance, but not a strategic priority." } },
  { title: "Freelance Marketplace for Voice Actors", description: "Niche two-sided marketplace connecting indie game studios with voice actors, 3% take rate.", assetType: "DIGITAL_BUSINESS", price: 76000, businessModel: "Marketplace", revenue: 58000, monthlyRevenue: 4800, profit: 29000, monthlyProfit: 2400, growthRate: 17, customers: 340 },
];

const DOMAINS: SeedAsset[] = [
  { title: "aiscout.dev", description: "Short, brandable domain ideal for an AI discovery or scouting product.", assetType: "DOMAIN", price: 8500, traffic: 400, metadata: { domain: "aiscout.dev", registrar: "Namecheap", domainAgeYears: 3 } },
  { title: "gpuforge.com", description: "Premium .com for a compute/GPU rental brand, exact-match keyword.", assetType: "DOMAIN", price: 22000, metadata: { domain: "gpuforge.com", registrar: "GoDaddy", domainAgeYears: 6 }, verificationSummary: "VERIFIED" },
  { title: "dataset.market", description: "Category-defining .market domain for a dataset marketplace.", assetType: "DOMAIN", price: 15000, metadata: { domain: "dataset.market", registrar: "Google Domains", domainAgeYears: 2 } },
  { title: "agentstack.io", description: "Clean, memorable .io for an AI agent infrastructure company.", assetType: "DOMAIN", price: 6200, metadata: { domain: "agentstack.io", registrar: "Namecheap", domainAgeYears: 1 } },
  { title: "promptvault.com", description: "Aged .com with residual SEO traffic from a prior prompt-library blog.", assetType: "DOMAIN", price: 11000, revenue: 400, traffic: 2100, metadata: { domain: "promptvault.com", registrar: "Namecheap", domainAgeYears: 8 } },
];

const AI_AGENTS: SeedAsset[] = [
  { title: "SupportPilot", description: "Autonomous support agent that resolves Zendesk tickets end-to-end for SaaS companies.", assetType: "AI_AGENT", price: 55000, revenue: 42000, monthlyRevenue: 3500, customers: 22, growthRate: 20, metadata: { whatItDoes: "Reads incoming tickets, resolves common issues, escalates the rest with a summary.", urlOrApi: "https://example.com/supportpilot/api", modelDependencies: "GPT-4o, Claude fallback", infrastructure: "AWS Lambda + Postgres", documentationUrl: "https://example.com/supportpilot/docs" }, verificationSummary: "PARTIAL" },
  { title: "SalesQualifier Agent", description: "Qualifies inbound leads via chat and books meetings directly on reps' calendars.", assetType: "AI_AGENT", price: 38000, revenue: 24000, monthlyRevenue: 2000, customers: 45, metadata: { whatItDoes: "Chats with inbound leads, scores intent, books calendar meetings.", modelDependencies: "GPT-4o-mini" } },
  { title: "Code Review Agent", description: "GitHub App that reviews PRs for security and style issues before a human looks at them.", assetType: "AI_AGENT", price: 71000, revenue: 60000, monthlyRevenue: 5000, customers: 310, growthRate: 14, metadata: { urlOrApi: "https://example.com/codereview-agent", infrastructure: "Vercel + GitHub Actions" }, verificationSummary: "VERIFIED" },
  { title: "Recruiting Screener Agent", description: "Screens resumes and conducts async voice interviews for high-volume hiring.", assetType: "AI_AGENT", price: 29000, revenue: 18000, monthlyRevenue: 1500, customers: 12 },
  { title: "Inventory Reorder Agent", description: "Monitors e-commerce inventory and auto-generates purchase orders to suppliers.", assetType: "AI_AGENT", price: 33000, revenue: 21600, monthlyRevenue: 1800, customers: 30, metadata: { infrastructure: "Shopify + supplier EDI integration" } },
];

const DATASETS: SeedAsset[] = [
  { title: "50k Labeled Customer Support Tickets", description: "Anonymized, labeled support tickets across intent, sentiment, and resolution category.", assetType: "DATASET", price: 4500, metadata: { sizeDescription: "1.2 GB", format: "JSONL", domain: "Customer support", recordCount: 50000, licensing: "Commercial, non-exclusive", source: "Aggregated from consenting SMB support inboxes", updateFrequency: "One-time" } },
  { title: "E-commerce Product Image Dataset", description: "220k product images with category, attribute, and background-removed variants.", assetType: "DATASET", price: 9000, metadata: { sizeDescription: "40 GB", format: "Images + CSV metadata", domain: "E-commerce / vision", recordCount: 220000, licensing: "Commercial, non-exclusive", updateFrequency: "One-time" }, verificationSummary: "VERIFIED" },
  { title: "Multilingual Legal Clause Corpus", description: "Contract clauses labeled by type and risk level across 6 languages.", assetType: "DATASET", price: 12000, metadata: { sizeDescription: "3.4 GB", format: "JSONL", domain: "Legal / NLP", recordCount: 180000, licensing: "Commercial, exclusive available", updateFrequency: "Quarterly" } },
  { title: "Restaurant Menu Item Embeddings", description: "Pre-computed embeddings + raw text for 1M restaurant menu items across the US.", assetType: "DATASET", price: 6000, metadata: { sizeDescription: "8 GB", format: "Parquet", domain: "Food / retrieval", recordCount: 1000000, licensing: "Commercial, non-exclusive" } },
  { title: "Synthetic Financial Transactions", description: "Fully synthetic, GDPR-safe transaction data for fraud-model training and demos.", assetType: "DATASET", price: 7500, metadata: { sizeDescription: "2 GB", format: "CSV", domain: "Finance / fraud", recordCount: 2000000, licensing: "Commercial, non-exclusive", source: "Synthetically generated" } },
];

const APIS: SeedAsset[] = [
  { title: "Address Validation API", description: "Global address validation and normalization API, 99.95% uptime SLA.", assetType: "API", price: 40000, revenue: 36000, pricingType: "USAGE_BASED" as PricingType, metadata: { endpoint: "https://api.example.com/v1/validate", requestsPerMonth: 4200000, uptimePercent: 99.95, documentationUrl: "https://example.com/address-api/docs" }, verificationSummary: "VERIFIED" },
  { title: "PDF-to-Structured-Data API", description: "Extracts structured fields from invoices, receipts, and forms via one endpoint.", assetType: "API", price: 51000, revenue: 44000, metadata: { endpoint: "https://api.example.com/v1/extract", requestsPerMonth: 1800000, uptimePercent: 99.9 } },
  { title: "Profanity & Toxicity Filter API", description: "Multilingual content moderation API used by 30+ community platforms.", assetType: "API", price: 26000, revenue: 19200, metadata: { endpoint: "https://api.example.com/v1/moderate", requestsPerMonth: 9500000, uptimePercent: 99.99 } },
];

const COMPUTE: SeedAsset[] = [
  { title: "8x H100 Cluster — US-East", description: "Dedicated 8x H100 80GB node with NVLink, available for hourly or monthly rental.", assetType: "COMPUTE", price: 18, pricingType: "HOURLY" as PricingType, metadata: { gpu: "NVIDIA H100 80GB", gpuCount: 8, vramGb: 640, cpu: "2x AMD EPYC 9654", ramGb: 1024, storage: "8TB NVMe", region: "us-east-1", availability: "Immediate", pricePerHour: 18, pricePerDay: 380, pricePerMonth: 9800, networkBandwidth: "400 Gbps" } },
  { title: "4x A100 Node — EU-West", description: "4x A100 40GB node, CUDA 12 preinstalled, Docker-ready.", assetType: "COMPUTE", price: 6.5, pricingType: "HOURLY" as PricingType, metadata: { gpu: "NVIDIA A100 40GB", gpuCount: 4, vramGb: 160, cpu: "AMD EPYC 7513", ramGb: 512, storage: "4TB NVMe", region: "eu-west-1", availability: "Immediate", pricePerHour: 6.5, pricePerDay: 140, pricePerMonth: 3600, networkBandwidth: "200 Gbps" } },
  { title: "Single RTX 4090 — APAC", description: "Single RTX 4090 24GB, good for inference workloads and small fine-tunes.", assetType: "COMPUTE", price: 0.9, pricingType: "HOURLY" as PricingType, metadata: { gpu: "NVIDIA RTX 4090", gpuCount: 1, vramGb: 24, cpu: "Intel i9-13900K", ramGb: 64, storage: "2TB NVMe", region: "ap-southeast-1", availability: "Available in 24h", pricePerHour: 0.9, pricePerDay: 18, pricePerMonth: 450 } },
];

async function main() {
  await prisma.user.upsert({
    where: { id: DEMO_SELLER_ID },
    update: {},
    create: { id: DEMO_SELLER_ID, email: DEMO_SELLER_EMAIL, name: "Demo Seller", role: "SELLER" },
  });

  const groups = [DIGITAL_BUSINESSES, DOMAINS, AI_AGENTS, DATASETS, APIS, COMPUTE];

  for (const group of groups) {
    for (const seedAsset of group) {
      const slug = slugify(seedAsset.title, Math.random().toString(36).slice(2, 7));
      await prisma.asset.create({
        data: {
          slug,
          title: seedAsset.title,
          description: seedAsset.description,
          assetType: seedAsset.assetType,
          status: "PUBLISHED",
          category: seedAsset.category,
          businessModel: seedAsset.businessModel,
          price: seedAsset.price,
          currency: seedAsset.currency ?? "USD",
          pricingType: seedAsset.pricingType ?? "FIXED",
          revenue: seedAsset.revenue,
          monthlyRevenue: seedAsset.monthlyRevenue,
          profit: seedAsset.profit,
          monthlyProfit: seedAsset.monthlyProfit,
          growthRate: seedAsset.growthRate,
          customers: seedAsset.customers,
          traffic: seedAsset.traffic,
          metadata: (seedAsset.metadata ?? {}) as Prisma.InputJsonValue,
          verificationSummary: seedAsset.verificationSummary ?? "UNVERIFIED",
          isSeedData: true,
          sellerId: DEMO_SELLER_ID,
        },
      });
    }
  }

  const rates: [AssetType, number][] = [
    ["DIGITAL_BUSINESS", 7.5],
    ["DOMAIN", 10],
    ["AI_AGENT", 10],
    ["DATASET", 10],
    ["API", 10],
    ["COMPUTE", 5],
  ];
  for (const [assetType, ratePercent] of rates) {
    await prisma.commissionRule.upsert({ where: { assetType }, update: { ratePercent }, create: { assetType, ratePercent } });
  }

  console.log(`Seeded ${groups.flat().length} demo assets.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
