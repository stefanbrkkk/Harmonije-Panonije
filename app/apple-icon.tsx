import { ImageResponse } from "next/og";

// iOS home-screen icon: the favicon's house-and-bee mark as a 180px PNG.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#18372e" }}>
        <svg width="180" height="180" viewBox="0 0 64 64">
          <path d="M18 42V28l14-10 14 10v14H18Z" fill="none" stroke="#f2e5bf" strokeWidth="3" strokeLinejoin="round" />
          <path d="M26 42V32h12v10" fill="none" stroke="#f2e5bf" strokeWidth="3" />
          <ellipse cx="45" cy="18" rx="5" ry="3.5" fill="#d59b3d" transform="rotate(-18 45 18)" />
          <path d="M41 18h8M44 15l2 6" stroke="#18372e" strokeWidth="1.5" />
          <path d="M41 14c-3-4-7-2-6 2M49 14c2-4 6-3 6 1" fill="none" stroke="#f2e5bf" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    ),
    size,
  );
}
