import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { SITE_URL } from "@/lib/brand";
import { ASSET_TYPES } from "@/lib/validation/asset";

const STATIC_ROUTES = [
  "",
  "/marketplace",
  "/sell",
  "/buy",
  "/how-it-works",
  "/about",
  "/pricing",
  "/methodology",
  "/how-we-protect-you",
  "/mandates",
  "/wind-down",
  "/valuate",
  "/index",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [assets] = await Promise.all([
    prisma.asset.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
  ]);

  const staticEntries = STATIC_ROUTES.map((route) => ({ url: `${SITE_URL}${route}`, lastModified: new Date() }));

  const categoryEntries = ASSET_TYPES.map((type) => ({
    url: `${SITE_URL}/marketplace/${type.toLowerCase().replace(/_/g, "-")}`,
    lastModified: new Date(),
  }));

  const assetEntries = assets.map((asset) => ({
    url: `${SITE_URL}/asset/${asset.slug}`,
    lastModified: asset.updatedAt,
  }));

  return [...staticEntries, ...categoryEntries, ...assetEntries];
}
