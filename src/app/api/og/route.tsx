import { renderOgImage } from "@/lib/og";
import { BRAND_TAGLINE } from "@/lib/brand";

/**
 * Homepage OG image, as a plain route handler rather than the `opengraph-image.tsx`
 * file convention -- co-locating that special file with `(public)/page.tsx` at a
 * route group's own root triggered a Vercel output-file-tracing bug where the
 * group-root `page.js` went missing from the deployed function bundle
 * ("Cannot find module '.next/server/app/(public)/page.js'"), 500ing the
 * homepage in production while every other route (one level deeper, no sibling
 * image file) built and ran fine. Decoupling the image generation from the page
 * segment sidesteps it entirely.
 */
export async function GET() {
  return renderOgImage(BRAND_TAGLINE, "Every listing is scored. Every deal is brokered.");
}
