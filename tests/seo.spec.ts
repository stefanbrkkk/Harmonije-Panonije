import { expect, test } from "@playwright/test";
import { trackErrors } from "./helpers";

test("metadata, sitemap, manifest, 404 and social images", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  const meta = await page.evaluate(() => ({
    canonical: document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href ?? "",
    robots: document.querySelector<HTMLMetaElement>('meta[name="robots"]')?.content ?? "",
    h1: document.querySelectorAll("main h1").length,
    mains: document.querySelectorAll("main").length,
    jsonLd: document.querySelectorAll('script[type="application/ld+json"]').length,
    skip: document.querySelectorAll(".skip-link").length,
  }));
  // Canonical is the absolute site root; local/preview builds never invite
  // indexing (VERCEL_ENV !== "production" in the test environment).
  expect(new URL(meta.canonical).pathname, "canonical points at the root").toBe("/");
  expect(meta.robots, "non-production builds are noindex").toMatch(/noindex/);
  expect(meta.robots).toMatch(/nofollow/);
  expect(meta.h1).toBe(1);
  expect(meta.mains).toBe(1);
  expect(meta.jsonLd).toBeGreaterThanOrEqual(1);
  expect(meta.skip).toBe(1);

  const notFound = await page.request.get("/nepostojeca-stranica-xyz");
  expect(notFound.status()).toBe(404);

  const sitemap = await page.request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain("urlset");

  const manifest = await page.request.get("/manifest.webmanifest");
  expect(manifest.status()).toBe(200);
  expect((await manifest.json()).icons?.length ?? 0).toBeGreaterThan(0);

  const appleIcon = await page.request.get("/apple-icon");
  expect(appleIcon.status(), "apple touch icon").toBe(200);
  expect(appleIcon.headers()["content-type"]).toContain("image/png");
  expect(await page.locator('link[rel="apple-touch-icon"]').count()).toBe(1);

  const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').first().textContent()) ?? "{}");
  const org = ld["@graph"]?.find((node: { "@type": string }) => node["@type"] === "Organization");
  expect(org?.brand, "brand is a typed Brand node").toEqual({ "@type": "Brand", name: "Immuno Craft" });
  // Client email (26 Sep 2026): home, growing and production in Budisava
  // since August 2025; the brand began in Novi Sad.
  expect(org?.address?.addressLocality).toBe("Budisava");
  expect(org?.foundingLocation?.name).toBe("Novi Sad");
  const manifestBody = await (await page.request.get("/manifest.webmanifest")).json();
  expect(manifestBody.description).toContain("Budisavi");
  expect(manifestBody.icons.map((icon: { sizes: string }) => icon.sizes)).toEqual(expect.arrayContaining(["192x192", "512x512"]));
  expect((await page.request.get("/favicon.ico")).status(), "favicon.ico").toBe(200);
  expect(await page.locator('meta[name="description"]').getAttribute("content")).toContain("Budisavi");

  for (const route of ["/opengraph-image", "/twitter-image"]) {
    const response = await page.request.get(route);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/png");
    expect((await response.body()).length).toBeGreaterThan(20_000);
  }

  // No unconfirmed prices anywhere in the catalog.
  const prices = await page.locator(".product-card__meta span:last-child").allTextContents();
  expect(prices.length).toBeGreaterThan(0);
  expect(prices.every((text) => text === "Cena po upitu")).toBe(true);

  // External destinations are described, never opened by tests.
  for (const link of await page.locator('a[target="_blank"]').all()) {
    expect(await link.getAttribute("rel")).toContain("noreferrer");
  }
  assertClean();
});
