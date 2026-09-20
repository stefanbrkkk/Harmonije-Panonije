import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/src/lib/siteUrl";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  const isProduction = process.env.VERCEL_ENV === "production" || Boolean(process.env.NEXT_PUBLIC_SITE_URL);
  return {
    rules: isProduction
      ? { userAgent: "*", allow: "/" }
      : { userAgent: "*", disallow: "/" },
    sitemap: isProduction ? `${siteUrl}/sitemap.xml` : undefined,
  };
}
