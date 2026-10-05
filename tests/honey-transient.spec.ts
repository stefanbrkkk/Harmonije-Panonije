import { expect, test } from "@playwright/test";
import { scrollToStickyProgress, trackErrors } from "./helpers";

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
  { width: 320, height: 568 },
  { width: 844, height: 390 },
]) {
  test(`scroll film stays synchronized and readable at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    const clean = trackErrors(page);
    await page.setViewportSize(viewport);
    await page.goto(process.env.HONEY_TEST_URL || "/", { waitUntil: "networkidle" });
    const video = page.locator(".honey-harvest__video");
    await expect(video).toBeVisible();
    await expect.poll(() => video.evaluate((node: HTMLVideoElement) => node.readyState)).toBeGreaterThanOrEqual(2);
    const duration = await video.evaluate((node: HTMLVideoElement) => node.duration);
    expect(duration).toBeGreaterThan(5.9);
    for (const fraction of [0, 0.25, 0.46, 0.6, 0.78, 0.95, 0.3, 0.85, 0.05]) {
      await scrollToStickyProgress(page, ".honey-harvest", fraction);
      await expect.poll(() => video.evaluate((node: HTMLVideoElement) => node.currentTime)).toBeCloseTo(fraction * (duration - 1 / 24), 1);
      const layout = await page.evaluate(() => {
        const chapters = [...document.querySelectorAll<HTMLElement>(".honey-harvest__chapter")];
        const active = chapters.filter((node) => Number(getComputedStyle(node).opacity) > 0.99);
        const copy = active[0].getBoundingClientRect();
        const film = document.querySelector(".honey-harvest__video")!.getBoundingClientRect();
        const header = document.querySelector(".site-header")!.getBoundingClientRect();
        return {
          count: active.length, copyTop: copy.top, copyBottom: copy.bottom,
          headerBottom: header.bottom, filmLeft: film.left, filmRight: film.right,
          filmTop: film.top, filmBottom: film.bottom,
          overlap: copy.left < film.right && film.left < copy.right && copy.top < film.bottom && film.top < copy.bottom,
        };
      });
      expect(layout.count).toBe(1);
      expect(layout.overlap).toBe(false);
      expect(layout.copyTop).toBeGreaterThanOrEqual(layout.headerBottom - 1);
      expect(layout.copyBottom).toBeLessThanOrEqual(viewport.height);
      expect(layout.filmLeft).toBeGreaterThanOrEqual(0);
      expect(layout.filmRight).toBeLessThanOrEqual(viewport.width);
      expect(layout.filmTop).toBeGreaterThanOrEqual(0);
      expect(layout.filmBottom).toBeLessThanOrEqual(viewport.height);
    }
    const still = await video.evaluate((node: HTMLVideoElement) => node.currentTime);
    await page.waitForTimeout(350);
    expect(await video.evaluate((node: HTMLVideoElement) => node.currentTime)).toBe(still);
    expect(await video.evaluate((node: HTMLVideoElement) => node.paused)).toBe(true);
    clean();
  });
}
