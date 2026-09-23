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

test("journey settles one chapter per position, forward and back", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });
  for (const [fraction, chapter] of [[0.1, 0], [0.62, 2], [0.95, 3], [0.38, 1]] as Array<[number, number]>) {
    await page.evaluate((f) => {
      const node = document.querySelector<HTMLElement>("#put-pcele")!;
      window.scrollTo({ top: node.offsetTop + f * (node.offsetHeight - window.innerHeight), behavior: "instant" });
    }, fraction);
    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const section = document.querySelector<HTMLElement>("#put-pcele")!;
            const active = [...section.querySelectorAll("[data-chapter]")].flatMap((n, i) => (n.classList.contains("is-active") ? [i] : []));
            const plates = [...section.querySelectorAll("[data-plate]")].map((n) => parseFloat(getComputedStyle(n).opacity));
            return JSON.stringify({ active, plate: plates.map((o) => (o > 0.98 ? 1 : o < 0.02 ? 0 : -1)) });
          }),
        { timeout: 5000, message: `chapter ${chapter + 1} at p=${fraction}` },
      )
      .toBe(JSON.stringify({ active: [chapter], plate: [0, 1, 2, 3].map((i) => (i === chapter ? 1 : 0)) }));
  }
  assertClean();
});

test("ingredient spread renders its plate, captions and index", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });
  const state = await page.evaluate(() => {
    const section = document.querySelector<HTMLElement>("#sastojci")!;
    // Deterministic jump to the anchor position (header + clearance).
    const header = document.querySelector(".site-header")!.getBoundingClientRect().height;
    window.scrollTo({ top: section.offsetTop - header - 6, behavior: "instant" });
    const art = section.querySelector("svg.ingredients-plate__art")!.getBoundingClientRect();
    const captions = [...section.querySelectorAll(".ingredients-base")].map((n) => n.getBoundingClientRect());
    return {
      art: art.width > 400 && art.height > 300,
      captionsBelowArt: captions.every((r) => r.top >= art.bottom - 1),
      captionsSideBySide: captions.length === 2 && captions[0].right <= captions[1].left + 1,
      index: section.querySelectorAll(".ingredients-index li").length,
      bottom: Math.max(...[...section.querySelectorAll(".ingredients-plate, .ingredients-index")].map((n) => n.getBoundingClientRect().bottom)),
    };
  });
  expect(state.art).toBe(true);
  expect(state.captionsBelowArt).toBe(true);
  expect(state.captionsSideBySide).toBe(true);
  expect(state.index).toBe(5);
  expect(state.bottom).toBeLessThanOrEqual(900);
  assertClean();
});
