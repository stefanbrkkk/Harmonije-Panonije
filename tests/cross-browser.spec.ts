import { expect, test } from "@playwright/test";
import { trackErrors } from "./helpers";

/**
 * Cross-engine smoke: the full matrix runs on Chromium; WebKit and Firefox
 * cover the critical paths so engine-specific breakage cannot slip through.
 * Run locally with --project=webkit / --project=firefox (browsers must be
 * installed: npx playwright install webkit firefox).
 */

test("initial render without overflow", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  expect(await page.locator(".hero-copy h1").count()).toBe(1);
  const overflow = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  expect(overflow.scroll).toBeLessThanOrEqual(overflow.client + 1);
  assertClean();
});

test("desktop anchor, search, inquiry and drawer", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/#proizvodi", { waitUntil: "networkidle" });
  await expect(page.locator("#proizvodi")).toBeVisible();
  await page.locator(".catalog-search input").fill("sargarepa");
  expect(await page.locator(".product-card").count()).toBe(1);
  await page.locator(".catalog-search input").fill("");
  await page.locator(".product-card__add").first().click();
  await expect(page.locator(".cart-toast")).toHaveClass(/is-visible/);
  await page.locator(".cart-toast button").first().click();
  await expect(page.locator(".order-drawer")).toHaveClass(/is-open/);
  await page.keyboard.press("Escape");
  await expect(page.locator(".order-drawer")).not.toHaveClass(/is-open/);
  assertClean();
});

test("mobile menu and reduced motion", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator(".menu-button").click();
  await expect(page.locator("#mobile-menu")).toHaveClass(/mobile-menu--open/);
  await page.keyboard.press("Escape");
  await expect(page.locator("#mobile-menu")).not.toHaveClass(/mobile-menu--open/);
  assertClean();
});

test("honey scene reaches a valid mid-state", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  const top = await page.evaluate(() => document.querySelector<HTMLElement>(".honey-harvest")!.offsetTop);
  const height = await page.evaluate(() => document.querySelector<HTMLElement>(".honey-harvest")!.offsetHeight);
  await page.evaluate(
    ([t, h]) => window.scrollTo({ top: t + 0.5 * (h - window.innerHeight), behavior: "instant" }),
    [top, height] as const,
  );
  await page.waitForTimeout(900);
  const state = await page.evaluate(() => ({
    bee: document.querySelector(".honey-macro-bee")?.getAttribute("transform") ?? "",
    chapter: ["a", "b", "c"].map(
      (suffix) => parseFloat(document.querySelector<HTMLElement>(`.honey-harvest__chapter--${suffix}`)?.style.opacity ?? "0"),
    ),
  }));
  expect(state.bee).toMatch(/translate/);
  expect(Math.max(...state.chapter)).toBeGreaterThan(0.9);
  assertClean();
});
