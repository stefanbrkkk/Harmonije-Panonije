import { expect, test, type Page } from "@playwright/test";
import { trackErrors } from "./helpers";

test.use({ viewport: { width: 390, height: 844 } });

async function openMenu(page: Page) {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator(".menu-button").click();
  await expect(page.locator("#mobile-menu")).toHaveClass(/mobile-menu--open/);
}

test("pointer open, close toggle and Escape", async ({ page }) => {
  const assertClean = trackErrors(page);
  await openMenu(page);
  // Toggle stays above the panel and remains clickable.
  await page.locator(".menu-button").click();
  await expect(page.locator("#mobile-menu")).not.toHaveClass(/mobile-menu--open/);
  await openMenu(page);
  await page.keyboard.press("Escape");
  await expect(page.locator("#mobile-menu")).not.toHaveClass(/mobile-menu--open/);
  assertClean();
});

test("Tab wraps across panel and close toggle", async ({ page }) => {
  const assertClean = trackErrors(page);
  await openMenu(page);
  let sawToggle = false;
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    const cls = await page.evaluate(() => document.activeElement?.className?.toString?.() ?? "");
    if (/menu-button/.test(cls)) {
      sawToggle = true;
      break;
    }
  }
  expect(sawToggle, "close toggle in Tab scope").toBe(true);
  await page.keyboard.press("Escape");
  assertClean();
});

test("background is inert while open, restored after close", async ({ page }) => {
  const assertClean = trackErrors(page);
  await openMenu(page);
  expect(await page.locator("main").getAttribute("inert")).not.toBeNull();
  // Programmatic focus into the background must not take hold.
  await page.locator("#proizvodi .product-card__add").first().focus();
  expect(await page.evaluate(() => document.activeElement?.tagName)).not.toBe("BUTTON");
  await page.keyboard.press("Escape");
  await expect.poll(async () => page.locator("[data-ov-inert]").count(), "no stale inert").toBe(0);
  assertClean();
});

test("short landscape menu scrolls internally", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.setViewportSize({ width: 844, height: 390 });
  await openMenu(page);
  const overflow = await page.locator("#mobile-menu").evaluate(
    (node) => getComputedStyle(node).overflowY,
  );
  expect(["auto", "scroll"]).toContain(overflow);
  const cta = page.locator("#mobile-menu .button");
  await cta.scrollIntoViewIfNeeded();
  await expect(cta).toBeInViewport();
  assertClean();
});

test("desktop resize reconciles open menu", async ({ page }) => {
  const assertClean = trackErrors(page);
  await openMenu(page);
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(page.locator("#mobile-menu")).not.toHaveClass(/mobile-menu--open/);
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
  expect(await page.locator("[data-ov-inert]").count()).toBe(0);
  assertClean();
});

test("menu to drawer handoff", async ({ page }) => {
  const assertClean = trackErrors(page);
  await openMenu(page);
  await page.locator("#mobile-menu .button").scrollIntoViewIfNeeded();
  await page.locator("#mobile-menu .button").click();
  await expect(page.locator(".order-drawer")).toHaveClass(/is-open/);
  await page.keyboard.press("Escape");
  await expect(page.locator(".order-drawer")).not.toHaveClass(/is-open/);
  assertClean();
});
