import type { MetadataRoute } from "next";

const BASE_URL = "https://titer.dev";

// Public marketing + the anonymous free tool. Excludes /login, /signup, and
// the gated app routes (/score, /visibility, /dashboard, /settings/*) --
// those sit behind auth and aren't meant to be indexed. /product/quality is
// gone (folded into Score) and redirects rather than 404s -- not listed here
// since a redirect target shouldn't itself be in the sitemap.
const ROUTES = [
  "",
  "/coming-soon",
  "/measure",
  "/product/score",
  "/product/visibility",
  "/pricing",
  "/solutions/agencies",
  "/solutions/brand-marketing",
  "/solutions/content-teams",
  "/solutions/support-cx",
  "/solutions/compliance",
  "/how-it-works",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
  }));
}
