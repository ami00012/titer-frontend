import { renderOgImage, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Titer for support & CX";

export default function Image() {
  return renderOgImage(
    "Catch a bad reply before it sends",
    "Score every AI-drafted reply for tone, via API.",
  );
}
