import { renderOgImage, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Titer Visibility — how often AI answers mention and cite your brand";

export default function Image() {
  return renderOgImage(
    "What AI answers say about your brand",
    "Track mentions across ChatGPT, Perplexity, and Google — and catch it when they're wrong.",
  );
}
