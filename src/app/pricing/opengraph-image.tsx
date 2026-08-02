import { renderOgImage, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Titer pricing";

export default function Image() {
  return renderOgImage("Pricing", "Free scanning to start. Paid plans add Quality audits and Visibility tracking.");
}
