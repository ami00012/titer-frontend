import { renderOgImage, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Titer Score — how strongly your writing connects emotionally";

export default function Image() {
  return renderOgImage(
    "How strongly your writing connects emotionally",
    "Five components, with the specific findings behind every score.",
  );
}
