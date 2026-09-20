import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Harmonije Panonije",
    short_name: "Harmonije Panonije",
    description: "Immuno Craft sirupi, sokovi i busteri iz Novog Sada.",
    start_url: "/",
    display: "standalone",
    background_color: "#f3eddf",
    theme_color: "#17362d",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
