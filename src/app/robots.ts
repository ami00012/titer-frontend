import type { MetadataRoute } from "next";

const BASE_URL = "https://titer.dev";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/settings", "/score", "/quality", "/visibility", "/login", "/signup"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
