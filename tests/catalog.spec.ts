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
  await expect(page.locator("#tab-busteri")).toBeFocused();
  await page.keyboard.press("Home");
  await expect(page.locator("#tab-sirupi")).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator("#tab-busteri")).toBeFocused();
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
  await expect(page.locator(".catalog-empty strong")).toHaveText("Nema poklapanja za „Šljiva Đ“ u ovoj kategoriji.");
  await page.locator(".catalog-empty .text-link").click();
  expect(await cards.count()).toBeGreaterThan(0);
  await expect(search, "focus returns to the search field").toBeFocused();
  assertClean();
});

test("search offers matches from the other categories and keeps the query", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/#proizvodi", { waitUntil: "networkidle" });
  const search = page.locator(".catalog-search input");
  await expect(page.locator("#tab-sirupi")).toHaveAttribute("aria-selected", "true");
  // The placeholder's own example: ginger lives in its own category.
  await search.fill("đumbir");
  const link = page.locator(".catalog-elsewhere__link", { hasText: "Đumbir" });
  await expect(link).toBeVisible();
  const promised = Number((await link.locator("span").textContent())?.replace(/\D/g, ""));
  expect(promised).toBeGreaterThan(0);
  await link.click();
  await expect(page.locator("#tab-djumbir")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#tab-djumbir"), "focus follows to the new tab").toBeFocused();
  await expect(search).toHaveValue("đumbir");
  await expect(page.locator(".product-card")).toHaveCount(promised);
  // Ordinary tab switching still starts a fresh browse.
  await page.locator("#tab-busteri").click();
  await expect(search).toHaveValue("");
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
  // Each card's artwork identity (product id + its label band colour).
  const labels = () =>
    page.locator(".product-card__visual .product-visual").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-artwork")));
  const snapshot = await labels();
  await page.locator(".catalog-search input").fill("a");
  await page.locator(".catalog-search input").fill("");
  expect(await labels()).toEqual(snapshot);
  await page.locator("#tab-busteri").click();
  await page.locator("#tab-sirupi").click();
  expect(await labels()).toEqual(snapshot);
  expect(new Set(snapshot).size, "every card has its own artwork").toBe(snapshot.length);
  assertClean();
});

test("the range follows the current labels: three categories, 0,75 l syrups", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/#proizvodi", { waitUntil: "networkidle" });
  await expect(page.locator(".catalog-tabs [role=tab]")).toHaveCount(3);
  for (const tab of ["#tab-sirupi", "#tab-djumbir"]) {
    await page.locator(tab).click();
    if (await page.locator(".catalog-more button").count()) await page.locator(".catalog-more button").click();
    const volumes = await page.locator(".product-card__meta span:first-child").allTextContents();
    expect(volumes.length).toBeGreaterThan(0);
    expect(volumes.every((volume) => volume === "0,75 l"), `${tab} volumes`).toBe(true);
  }
  expect(await page.locator("body").innerText()).not.toMatch(/0[,.]8\s*l\b|sokovi/i);
  assertClean();
});

test("a category with a short last row closes it cleanly", async ({ page }) => {
  const assertClean = trackErrors(page);
  for (const viewport of [{ width: 1440, height: 900 }, { width: 768, height: 1024 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/#proizvodi", { waitUntil: "networkidle" });
    await page.locator("#tab-busteri").click();
    const layout = await page.evaluate(() => {
      const grid = document.querySelector(".product-grid")!.getBoundingClientRect();
      const cards = [...document.querySelectorAll(".product-card")].map((card) => card.getBoundingClientRect());
      return { grid: grid.width, last: cards[cards.length - 1].width, count: cards.length };
    });
    expect(layout.count).toBe(3);
    expect(layout.last / layout.grid, `last card spans the row at ${viewport.width}`).toBeGreaterThan(0.97);
  }
  assertClean();
});

test("how to enjoy and store a syrup is on the page, at every width", async ({ page }) => {
  const assertClean = trackErrors(page);
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/#proizvodi", { waitUntil: "networkidle" });
    const strip = page.locator(".catalog-ritual");
    await strip.scrollIntoViewIfNeeded();
    await expect(strip).toBeVisible();
    await expect(strip).toContainText("3–3,5 litra");
    await expect(strip).toContainText("frižideru do mesec dana");
    await expect(strip).toContainText("promućkajte");
    await expect(strip.locator("dt")).toHaveText(["Na kašiku", "Sa vodom", "U koktelima i kolačima", "Ujutru, pre jela"]);
    const overflow = await page.evaluate(() => {
      const box = document.querySelector(".catalog-ritual")!.getBoundingClientRect();
      return { right: box.right, vw: document.documentElement.clientWidth };
    });
    expect(overflow.right, `strip fits at ${width}`).toBeLessThanOrEqual(overflow.vw + 1);
  }
  // Dilution and bottle storage are syrup facts: not shown under the jars.
  await page.locator("#tab-busteri").click();
  await expect(page.locator(".catalog-ritual")).toHaveCount(0);
  await page.locator("#tab-djumbir").click();
  await expect(page.locator(".catalog-ritual")).toHaveCount(1);
  assertClean();
});

test("the availability badge stays inside the card art on small phones", async ({ page }) => {
  const assertClean = trackErrors(page);
  for (const width of [320, 360, 390]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/#proizvodi", { waitUntil: "networkidle" });
    const clipped = await page.evaluate(() =>
      [...document.querySelectorAll(".product-card")].flatMap((card) => {
        const pane = card.querySelector(".product-card__visual")!.getBoundingClientRect();
        const badge = card.querySelector(".product-card__availability")!.getBoundingClientRect();
        return badge.left < pane.left - 0.5 || badge.right > pane.right + 0.5 ? [card.getAttribute("data-product")] : [];
      }),
    );
    expect(clipped, `badges clipped at ${width}`).toEqual([]);
  }
  assertClean();
});

test("keyboard expand keeps focus on screen; search results sit under the field", async ({ page }) => {
  const assertClean = trackErrors(page);
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    // A fresh document each time (a same-URL hash goto would keep the state).
    await page.goto("/", { waitUntil: "networkidle" });
    const toggle = page.locator(".catalog-more button");
    await toggle.scrollIntoViewIfNeeded();
    await toggle.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(".product-card")).toHaveCount(8);
    // Focus lands on the first new card, which is where the toggle was.
    await expect(page.locator(".product-card").nth(6)).toBeFocused();
    const focused = await page.evaluate(() => {
      const rect = document.activeElement!.getBoundingClientRect();
      return { top: rect.top, header: document.querySelector(".site-header")!.getBoundingClientRect().bottom, vh: window.innerHeight };
    });
    expect(focused.top, `focused card on screen at ${viewport.width}`).toBeGreaterThanOrEqual(focused.header - 1);
    expect(focused.top, `focused card on screen at ${viewport.width}`).toBeLessThan(focused.vh - 40);
  }
  // While searching, the category intro is really hidden (display, not just the attribute).
  await page.locator(".catalog-search input").fill("kupina");
  await expect(page.locator(".catalog-panel__intro")).toBeHidden();
  assertClean();
});
