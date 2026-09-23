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
  // Keep tabbing until the first "add to inquiry" control, then use it.
  let reached = false;
  for (let i = 0; i < 40 && !reached; i += 1) {
    await page.keyboard.press("Tab");
    reached = await page.evaluate(() => !!document.activeElement?.matches(".product-card__add"));
  }
  expect(reached, "catalog add control reachable by Tab").toBe(true);
  const label = await page.evaluate(() => document.activeElement?.getAttribute("aria-label") ?? "");
  expect(label, "add control names its product").toMatch(/^Dodaj .+ u upit$/);
  const box = await page.evaluate(() => {
    const rect = document.activeElement!.getBoundingClientRect();
    return { top: rect.top, bottom: rect.bottom, header: document.querySelector(".site-header")!.getBoundingClientRect().bottom };
  });
  expect(box.top, "focused control clears the fixed header").toBeGreaterThanOrEqual(box.header);
  await page.keyboard.press("Enter");
  await expect(page.locator(".order-button__count")).toHaveText("1");
  await expect(page.locator(".order-button")).toHaveAttribute("aria-label", /1 komad$/);
  assertClean();
});

test("phone: keyboard focus never hides behind the fixed order bar", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#proizvodi", { waitUntil: "networkidle" });
  await page.locator(".catalog-search input").focus();
  const bar = await page.locator(".mobile-order-bar").boundingBox();
  expect(bar).not.toBeNull();
  let checked = 0;
  for (let i = 0; i < 40 && checked < 6; i += 1) {
    await page.keyboard.press("Tab");
    const box = await page.evaluate(() => {
      const node = document.activeElement as HTMLElement | null;
      if (!node?.matches(".product-card__add")) return null;
      const rect = node.getBoundingClientRect();
      return { top: rect.top, bottom: rect.bottom };
    });
    if (!box) continue;
    checked += 1;
    // Focus scrolling may be smooth: wait for it to settle.
    await expect
      .poll(() => page.evaluate(() => (document.activeElement as HTMLElement).getBoundingClientRect().bottom), {
        message: "focused add button clears the order bar",
      })
      .toBeLessThanOrEqual(bar!.y);
  }
  expect(checked).toBeGreaterThan(3);
  assertClean();
});
