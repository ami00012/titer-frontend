import { renderOgImage, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Titer for compliance";

export default function Image() {
  return renderOgImage(
    "A record of what was measured, flagged, and reviewed",
    "Titer measures patterns and flags them for review — it doesn't determine compliance.",
  );
}
