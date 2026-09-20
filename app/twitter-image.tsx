import { createSocialImage } from "@/src/lib/socialImage";

export const alt = "Harmonije Panonije — Immuno Craft";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return createSocialImage();
}
