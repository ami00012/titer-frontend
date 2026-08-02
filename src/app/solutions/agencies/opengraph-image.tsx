import { renderOgImage, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Titer for SEO agencies";

export default function Image() {
  return renderOgImage(
    "Client sites, audited before Google notices",
    "Run every client page through one score, worst-first.",
  );
}
