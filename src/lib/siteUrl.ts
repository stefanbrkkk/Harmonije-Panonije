/**
 * Canonical site origin. An explicit NEXT_PUBLIC_SITE_URL may be entered with
 * or without protocol ("harmonije.rs" or "https://harmonije.rs/"); it is
 * normalized to an https origin so `new URL()` in metadata never throws.
 */
export function getSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    const withProtocol = /^https?:\/\//i.test(explicit) ? explicit : `https://${explicit}`;
    try {
      return new URL(withProtocol).origin;
    } catch {
      // Fall through to the deployment defaults on an unusable value.
    }
  }

  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercelHost) return `https://${vercelHost}`;

  return "http://localhost:3000";
}

/**
 * Indexing policy: only the production deployment invites search engines.
 * Vercel marks it with VERCEL_ENV=production; any other host opts in
 * explicitly with SITE_INDEXABLE=1. Previews and local builds stay noindex.
 */
export function isIndexable() {
  return process.env.VERCEL_ENV === "production" || process.env.SITE_INDEXABLE === "1";
}
