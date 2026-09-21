import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/src/lib/siteUrl";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  // Indexing policy depends ONLY on the deployment environment (HP-24).
  const isProduction = process.env.VERCEL_ENV === "production";
  return {
    rules: isProduction
      ? { userAgent: "*", allow: "/" }
      : { userAgent: "*", disallow: "/" },
    sitemap: isProduction ? `${siteUrl}/sitemap.xml` : undefined,
  };
}
