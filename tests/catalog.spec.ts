import { expect, test } from "@playwright/test";
import { trackErrors } from "./helpers";

test("product tabs: arrows, Home, End", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator("#tab-sirupi").click();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#tab-djumbir")).toBeFocused();
  expect(await page.locator("#tab-djumbir").getAttribute("aria-selected")).toBe("true");
  await page.keyboard.press("End");
  await expect(page.locator("#tab-sokovi")).toBeFocused();
  await page.keyboard.press("Home");
  await expect(page.locator("#tab-sirupi")).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator("#tab-sokovi")).toBeFocused();
  assertClean();
});

test("search: terms, whitespace, diacritics, empty state", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  const search = page.locator(".catalog-search input");
  const cards = page.locator(".product-card");
  await search.fill("kupina");
  await expect(cards.first()).toBeVisible();
  expect(await cards.count()).toBeGreaterThan(0);
  await search.fill("   ");
  expect(await cards.count()).toBe(6);
  await page.locator("#tab-djumbir").click();
  await search.fill("djumbir");
  const folded = await cards.count();
  await search.fill("đumbir");
  expect(await cards.count()).toBe(folded);
  await expect(page.locator(".catalog-count")).toContainText(/rezultat/i);
  await page.locator("#tab-sirupi").click();
  await search.fill("ŠIPURAK");
  await expect(cards.first(), "uppercase with diacritics still matches").toContainText(/šipurak/i);
  await search.fill("sargarepa");
  await expect(cards.first(), "ascii query matches šargarepa").toContainText(/šargarepa/i);
  await search.fill("  Šljiva Đ ");
  await expect(page.locator(".catalog-empty")).toBeVisible();
  // The empty state quotes what the visitor typed, not the folded query.
  await expect(page.locator(".catalog-empty strong")).toHaveText("Nema poklapanja za „Šljiva Đ“.");
  await page.locator(".catalog-empty .text-link").click();
  expect(await cards.count()).toBeGreaterThan(0);
  await expect(search, "focus returns to the search field").toBeFocused();
  assertClean();
});

test("expansion preserves identity and viewport, animates only additions", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator("#proizvodi").scrollIntoViewIfNeeded();
  const titles = page.locator(".product-card h4");
  const before = await titles.allTextContents();
  expect(before.length).toBe(6);
  const yBefore = await page.evaluate(() => window.scrollY);
  await page.locator(".catalog-more button").evaluate((node) => (node as HTMLElement).click());
  await page.waitForFunction(
    (n) => document.querySelectorAll(".product-card").length > n,
    before.length,
  );
  const after = await titles.allTextContents();
  expect(after.slice(0, before.length)).toEqual(before);
  const yAfter = await page.evaluate(() => window.scrollY);
  expect(Math.abs(yAfter - yBefore)).toBeLessThan(4);
  // New-cards-only animation marker clears after the transition.
  await expect.poll(async () => page.locator(".product-card--new").count()).toBe(0);
  // Collapse returns to a useful position.
  await page.locator(".catalog-more button").evaluate((node) => (node as HTMLElement).click());
  await expect(page.locator(".catalog-more button")).toBeInViewport();
  assertClean();
});

test("tablet sixth card uses the standard stacked layout", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator("#proizvodi").scrollIntoViewIfNeeded();
  const sixth = page.locator(".product-card").nth(5);
  const layout = await sixth.evaluate((node) => {
    const visual = node.querySelector<HTMLElement>(".product-card__visual")!.getBoundingClientRect();
    const body = node.querySelector<HTMLElement>(".product-card__body")!.getBoundingClientRect();
    return { stacked: Math.abs(visual.bottom - body.top) < 4, width: body.width };
  });
  expect(layout.stacked).toBe(true);
  expect(layout.width).toBeGreaterThan(200);
  assertClean();
});

test("artwork identity is stable across filter and tab changes", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  const labels = () =>
    page.locator(".product-card__visual .product-bottle__label strong, .product-card__visual .product-jar__label strong").allTextContents();
  const snapshot = await labels();
  await page.locator(".catalog-search input").fill("a");
  await page.locator(".catalog-search input").fill("");
  expect(await labels()).toEqual(snapshot);
  await page.locator("#tab-sokovi").click();
  await page.locator("#tab-sirupi").click();
  expect(await labels()).toEqual(snapshot);
  assertClean();
});
