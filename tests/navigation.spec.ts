import { expect, test } from "@playwright/test";
import { trackErrors } from "./helpers";

const anchors = ["#proizvodi", "#prica", "#sastojci", "#dostava", "#kontakt"];
const clearanceViewports = [
  { width: 1440, height: 900 },
  { width: 1280, height: 800 },
  { width: 1024, height: 768 },
  { width: 844, height: 390 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
  { width: 320, height: 568 },
];

test("home and anchors resolve with header clearance", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator(".hero-copy h1")).toBeVisible();
  for (const viewport of clearanceViewports) {
    await page.setViewportSize(viewport);
    await page.goto("/", { waitUntil: "networkidle" });
    for (const anchor of anchors) {
      // Native fragment navigation (same mechanism as real anchor clicks
      // and deep links); goto() with a hash-only change is unreliable.
      await page.evaluate((sel) => {
        window.location.hash = sel;
      }, anchor);
      // Smooth anchor scrolling must settle before measuring.
      await page.waitForTimeout(1100);
      const geometry = await page.evaluate((sel) => {
        const target = document.querySelector(sel)!.getBoundingClientRect();
        const header = document.querySelector(".site-header")!.getBoundingClientRect();
        return { top: target.top, bottom: header.bottom };
      }, anchor);
      // Anchored content clears the fixed header with breathing room.
      expect(geometry.top, `${anchor} clears header at ${viewport.width}`).toBeGreaterThanOrEqual(
        geometry.bottom + 2,
      );
    }
  }
  assertClean();
});

test("deep-link refresh and browser history", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/#proizvodi", { waitUntil: "networkidle" });
  await expect(page.locator("#proizvodi")).toBeVisible();
  await page.goto("/#put-pcele", { waitUntil: "networkidle" });
  const bee = await page.locator("#put-pcele .journey-bee").getAttribute("transform");
  expect(bee, "journey renders a live state on deep link").toMatch(/translate/);
  await expect(page.locator("#put-pcele")).toHaveClass(/is-live/);
  await page.goBack();
  await expect(page).toHaveURL(/#proizvodi/);
  await expect(page.locator("#proizvodi")).toBeVisible();
  await page.goForward();
  await expect(page).toHaveURL(/#put-pcele/);
  assertClean();
});
