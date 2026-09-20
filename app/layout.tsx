import type { Metadata, Viewport } from "next";
import { getSiteUrl } from "@/src/lib/siteUrl";
import "./globals.css";

const description = "Ručno pravljeni Immuno Craft proizvodi iz Novog Sada — sirupi, sokovi i busteri sa livadskim medom, ceđenim limunom, voćem i biljem.";
const siteUrl = getSiteUrl();
const shouldIndex = process.env.VERCEL_ENV === "production" || Boolean(process.env.NEXT_PUBLIC_SITE_URL);

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
