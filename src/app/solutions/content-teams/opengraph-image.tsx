import { renderOgImage, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Titer for content teams";

export default function Image() {
  return renderOgImage(
    "A house standard every draft has to clear",
    "Block publish when a draft crosses your line.",
  );
}
