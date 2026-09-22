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
  expect(meta.canonical).toContain("/");
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
