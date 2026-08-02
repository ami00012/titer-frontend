import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  async redirects() {
    return [
      // Quality folded into Score (site-wide audits are now a Score FAQ
      // entry, not a separate product) -- redirect rather than 404 so
      // existing links/bookmarks still land somewhere useful.
      {
        source: "/product/quality",
        destination: "/product/score",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
