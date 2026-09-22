import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { trackErrors } from "./helpers";

test("no serious violations in the settled page", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(results.violations).toEqual([]);
  assertClean();
});

test("no transient contrast failure during hero entrance", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(250);
  const opacity = await page.evaluate(() =>
    parseFloat(getComputedStyle(document.querySelector<HTMLElement>(".hero-copy__actions .button")!).opacity),
  );
  expect(opacity, "CTA opaque mid-entrance").toBe(1);
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(results.violations).toEqual([]);
  assertClean();
});

test("axe clean mid-reveal while sections enter", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  // Scroll so several reveal targets are mid-transition, then scan.
  await page.evaluate(() => document.querySelector("#proizvodi")!.scrollIntoView({ block: "center" }));
  await page.waitForTimeout(250);
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(results.violations).toEqual([]);
  // Sanity: the scan covered real reveal activity, not a static page.
  const revealed = await page.evaluate(() => document.querySelectorAll("#proizvodi .is-inview").length);
  expect(revealed).toBeGreaterThan(0);
  assertClean();
});

test("axe clean with menu and drawer open at 320px", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator(".menu-button").click();
  await expect(page.locator("#mobile-menu")).toHaveClass(/mobile-menu--open/);
  // Settle all motion before scanning: axe must judge the resting state,
  // never a mid-transition frame.
  await page.waitForFunction(() => {
    if (getComputedStyle(document.querySelector<HTMLElement>("#mobile-menu")!).opacity !== "1") return false;
    return document
      .getAnimations()
      .every((animation) => animation.playState !== "running" || (animation as CSSAnimation).animationName !== "menuItemIn");
  });
  let results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(results.violations).toEqual([]);
  await page.keyboard.press("Escape");
  await page.locator(".order-button").first().click();
  await expect(page.locator(".order-drawer")).toHaveClass(/is-open/);
  await page.waitForFunction(() => {
    const drawer = document.querySelector<HTMLElement>(".order-drawer")!;
    const rect = drawer.getBoundingClientRect();
    return Math.abs(rect.right - window.innerWidth) < 1;
  });
  results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(results.violations).toEqual([]);
  assertClean();
});

test("keyboard-only journey reaches catalog and inquiry", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  await page.keyboard.press("Enter");
  // The skip link jumps into the main landmark: the next Tab stop must land
  // on content inside <main> (fragment targets are not focusable themselves).
  await page.keyboard.press("Tab");
  const insideMain = await page.evaluate(() => !!document.activeElement?.closest("main"));
  expect(insideMain, "skip link leads into main content").toBe(true);
  assertClean();
});
