import { renderOgImage, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "How Titer actually works";

export default function Image() {
  return renderOgImage(
    "How Titer actually works",
    "One judge, five components, calibrated against vocabulary without substance.",
  );
}
