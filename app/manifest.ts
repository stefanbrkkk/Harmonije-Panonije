import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Harmonije Panonije",
    short_name: "Harmonije",
    description: "Immuno Craft sirupi i Immuno Booster tegle sa porodičnog gazdinstva u Budisavi.",
    start_url: "/",
    display: "standalone",
    background_color: "#f3eddf",
    theme_color: "#f3eddf",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
