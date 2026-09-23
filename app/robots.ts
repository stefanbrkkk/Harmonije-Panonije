import type { MetadataRoute } from "next";
import { getSiteUrl, isIndexable } from "@/src/lib/siteUrl";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  // Indexing policy depends ONLY on the deployment environment (HP-24).
  const isProduction = isIndexable();
  return {
    rules: isProduction
      ? { userAgent: "*", allow: "/" }
      : { userAgent: "*", disallow: "/" },
    sitemap: isProduction ? `${siteUrl}/sitemap.xml` : undefined,
  };
}
