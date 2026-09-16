import { renderOgImage, OG_SIZE } from "@/lib/og";
import { BRAND_NAME } from "@/lib/brand";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = `${BRAND_NAME} — The exchange for the AI economy`;

export default function Image() {
  return renderOgImage("The Exchange for the AI Economy", "Buy, sell and rent digital assets, AI agents, data and compute.");
}
