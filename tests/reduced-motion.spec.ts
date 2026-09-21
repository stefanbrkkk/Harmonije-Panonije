import { expect, test } from "@playwright/test";
import { trackErrors } from "./helpers";

test.use({ reducedMotion: "reduce" });

test("reduced motion shows all meaningful content statically", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  expect(await page.locator(".page-bee").evaluate((node) => getComputedStyle(node).display)).toBe("none");
  for (const suffix of ["a", "b", "c"]) {
    const chapter = page.locator(`.honey-harvest__chapter--${suffix}`);
    await expect(chapter).toBeVisible();
    expect((await chapter.boundingBox())!.height).toBeGreaterThan(60);
  }
  await expect(page.locator(".bee-journey__outro")).toBeVisible();
  for (const heading of await page.locator(".section-heading h2").all()) {
    await expect(heading).toBeVisible();
  }
  assertClean();
});

test("reduced motion performs no perpetual scheduler work", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.addInitScript(() => {
    (window as unknown as { __rafCount: number }).__rafCount = 0;
    const original = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (callback: FrameRequestCallback) => {
      (window as unknown as { __rafCount: number }).__rafCount += 1;
      return original(callback);
    };
  });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo({ top: 3000, behavior: "instant" }));
  await page.waitForTimeout(1200);
  const first = await page.evaluate(() => (window as unknown as { __rafCount: number }).__rafCount);
  await page.waitForTimeout(2000);
  const second = await page.evaluate(() => (window as unknown as { __rafCount: number }).__rafCount);
  expect(second - first, "idle rAF churn under reduced motion").toBeLessThanOrEqual(4);
  assertClean();
});
