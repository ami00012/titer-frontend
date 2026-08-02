import { renderOgImage, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Titer for brand & marketing";

export default function Image() {
  return renderOgImage(
    "What AI engines say about your brand",
    "And where they're wrong.",
  );
}
