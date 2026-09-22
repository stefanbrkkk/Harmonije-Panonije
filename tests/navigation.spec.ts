import { expect, test } from "@playwright/test";
import { trackErrors } from "./helpers";

const anchors = ["#proizvodi", "#prica", "#sastojci", "#dostava", "#kontakt"];

test("home and anchors resolve with header clearance", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator(".hero-copy h1")).toBeVisible();
  for (const anchor of anchors) {
    await page.goto(`/${anchor}`, { waitUntil: "networkidle" });
    const box = await page.locator(anchor).boundingBox();
    expect(box, `${anchor} visible`).not.toBeNull();
    // Fixed header is ~82px: anchored content must clear it.
    expect(box!.y, `${anchor} clears header`).toBeGreaterThanOrEqual(40);
  }
  assertClean();
});

test("deep-link refresh and browser history", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/#proizvodi", { waitUntil: "networkidle" });
  await expect(page.locator("#proizvodi")).toBeVisible();
  await page.goto("/#put-pcele", { waitUntil: "networkidle" });
  const bee = await page.locator("#put-pcele .scene-bee").getAttribute("transform");
  expect(bee, "journey renders mid-state on deep link").toMatch(/translate/);
  await page.goBack();
  await expect(page).toHaveURL(/#proizvodi/);
  await expect(page.locator("#proizvodi")).toBeVisible();
  await page.goForward();
  await expect(page).toHaveURL(/#put-pcele/);
  assertClean();
});
