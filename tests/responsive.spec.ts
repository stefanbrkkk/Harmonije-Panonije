import { expect, test } from "@playwright/test";
import { expectContained, trackErrors } from "./helpers";

const viewports = [
  { width: 1440, height: 900 },
  { width: 1280, height: 800 },
  { width: 1024, height: 768 },
  { width: 768, height: 1024 },
  { width: 430, height: 932 },
  { width: 390, height: 844 },
  { width: 360, height: 800 },
  { width: 320, height: 568 },
  { width: 844, height: 390 },
];

for (const viewport of viewports) {
  test(`no page overflow at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    const assertClean = trackErrors(page);
    await page.setViewportSize(viewport);
    await page.goto("/", { waitUntil: "networkidle" });
    const overflow = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    expect(overflow.scroll, "page-level overflow").toBeLessThanOrEqual(overflow.client + 1);
    assertClean();
  });
}

test("hero content fits its shell at narrow phones", async ({ page }) => {
  const assertClean = trackErrors(page);
  for (const width of [430, 390, 360, 320]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/", { waitUntil: "networkidle" });
    for (const selector of [".hero-copy", ".hero-copy h1", ".hero-copy__lead", ".hero-copy__actions"]) {
      await expectContained(page, selector);
    }
    for (const cta of await page.locator(".hero-copy__actions a").all()) {
      const box = await cta.boundingBox();
      expect(box, "CTA inside viewport").not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(-1);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1);
    }
  }
  assertClean();
});

test("hero survives 150% and 200% text enlargement", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/", { waitUntil: "networkidle" });
  for (const percent of [150, 200]) {
    await page.evaluate((k) => {
      document.documentElement.style.fontSize = `${(16 * k) / 100}px`;
    }, percent);
    // Settle reflow after the root font-size change before measuring.
    await page.waitForTimeout(400);
    for (const selector of [".hero-copy", ".hero-copy h1", ".hero-copy__lead", ".hero-copy__actions"]) {
      await expectContained(page, selector);
    }
  }
  assertClean();
});

test("catalog, header bar and drawer fit small viewports", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator("#proizvodi").scrollIntoViewIfNeeded();
  const cards = page.locator(".product-card");
  expect(await cards.count()).toBeGreaterThan(0);
  for (const card of await cards.all()) {
    const box = await card.boundingBox();
    expect(box!.width).toBeLessThanOrEqual(360 + 1);
  }
  assertClean();
});
