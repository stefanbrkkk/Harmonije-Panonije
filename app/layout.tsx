import type { Metadata, Viewport } from "next";
import { getSiteUrl, isIndexable } from "@/src/lib/siteUrl";
import "./globals.css";

const description = "Ručno pravljeni Immuno Craft proizvodi iz Novog Sada — sirupi, sokovi i busteri sa livadskim medom, ceđenim limunom, voćem i biljem.";
const siteUrl = getSiteUrl();
// Indexing policy depends ONLY on the deployment environment (HP-24):
// previews stay noindex/disallow even when NEXT_PUBLIC_SITE_URL is set;
// hosts other than Vercel opt in with SITE_INDEXABLE=1.
// The site URL variable only controls canonical/OG URL wording.
const shouldIndex = isIndexable();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Harmonije Panonije | Immuno Craft sirupi, sokovi i busteri",
    template: "%s | Harmonije Panonije",
  },
  description,
  applicationName: "Harmonije Panonije",
  authors: [{ name: "Harmonije Panonije" }],
  creator: "Harmonije Panonije",
  publisher: "Harmonije Panonije",
  category: "Hrana i piće",
  keywords: [
    "Harmonije Panonije",
    "Immuno Craft",
    "sirupi Novi Sad",
    "craft sirupi",
    "sirupi sa medom",
    "sokovi Novi Sad",
    "busteri",
    "livadski med",
    "ceđeni limun",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "sr_RS",
    siteName: "Harmonije Panonije",
    title: "Harmonije Panonije | Immuno Craft",
    description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Harmonije Panonije | Immuno Craft",
    description,
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    // Explicit `icons` metadata disables the file convention, so the
    // generated iOS home-screen icon (app/apple-icon.tsx) is listed here.
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  },
  formatDetection: { telephone: false, email: false, address: false },
  robots: {
    index: shouldIndex,
    follow: shouldIndex,
    googleBot: {
      index: shouldIndex,
      follow: shouldIndex,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3eddf" },
    { media: "(prefers-color-scheme: dark)", color: "#17362d" },
  ],
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sr-Latn">
      <body>{children}</body>
    </html>
  );
}
