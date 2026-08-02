import { renderOgImage, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Titer — measure what's in your content";

export default function Image() {
  return renderOgImage(
    "Measure what's in your content",
    "Titer Score, Titer Compliance, and Titer Visibility — one instrument.",
  );
}
