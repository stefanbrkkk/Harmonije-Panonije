import { expect, test } from "@playwright/test";
import { scrollToStickyProgress, trackErrors } from "./helpers";

const honeyPoints: Array<[fraction: number, minDominant: number]> = [
  // Resting positions: one fully dominant chapter (sequential handoff —
  // the outgoing lifts away before the incoming rises, so two large
  // headings never share coordinates at near-equal opacity).
  [0, 0.9],
  [0.15, 0.9],
  [0.35, 0.9],
  [0.5, 0.9],
  [0.8, 0.9],
  [0.95, 0.9],
  [1, 0.9],
  // Former handoff midpoint: chapter A now fully dominant (B still hidden).
  [0.265, 0.9],
  [0.665, 0.9],
];

test("HoneyHarvest chapters stay readable across progress", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  for (const [fraction, minDominant] of honeyPoints) {
    await scrollToStickyProgress(page, ".honey-harvest", fraction);
    // Settle the damped loop before asserting the resting state.
    await page.waitForTimeout(900);
    const opacities: number[] = await page.evaluate(() =>
      [".honey-harvest__chapter--a", ".honey-harvest__chapter--b", ".honey-harvest__chapter--c"].map(
        (selector) => parseFloat(document.querySelector<HTMLElement>(selector)?.style.opacity ?? "0"),
      ),
    );
    expect(Math.max(...opacities), `readable chapter at p=${fraction}`).toBeGreaterThan(minDominant);
    expect(
      opacities.filter((value) => value > 0.03 && value < 0.12).length,
      `no dual-faint trough at p=${fraction}`,
    ).toBe(0);
  }
  assertClean();
});

test("persistent bee yields to dedicated-artwork sections", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  // Sections with their own artwork suppress the global bee…
  for (const selector of ["#prica", "#sastojci", "#dostava", "#kontakt"]) {
    await page.evaluate((sel) => {
      const node = document.querySelector<HTMLElement>(sel)!;
      window.scrollTo({ top: node.offsetTop + node.offsetHeight / 2 - window.innerHeight * 0.48, behavior: "instant" });
    }, selector);
    // Damped fade: poll until settled instead of assuming a frame budget.
    await expect
      .poll(
        () => page.evaluate(() => parseFloat(getComputedStyle(document.querySelector(".page-bee")!).opacity)),
        { message: `bee hidden in ${selector}`, timeout: 4000 },
      )
      .toBeLessThan(0.2);
  }
  // …while connective sections keep the motif wherever free space allows
  // (the bee fades over text, so presence is sampled across the catalog).
  const seen = await page.evaluate(async () => {
    const node = document.querySelector<HTMLElement>("#proizvodi")!;
    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    for (let y = node.offsetTop; y < node.offsetTop + node.offsetHeight; y += window.innerHeight * 0.4) {
      window.scrollTo({ top: y, behavior: "instant" });
      await wait(700);
      if (parseFloat(getComputedStyle(document.querySelector(".page-bee")!).opacity) > 0.5) return true;
    }
    return false;
  });
  expect(seen, "bee present between scenes").toBe(true);
  assertClean();
});

test("rapid scroll, reverse and mid-scene resize stay valid", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
  await page.waitForTimeout(800);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(800);
  const state = await page.evaluate(() => ({
    bee: document.querySelector(".page-bee")!.getAttribute("style") ?? "",
    journey: document.querySelector("#put-pcele .journey-bee")?.getAttribute("transform") ?? "",
  }));
  expect(/NaN|undefined/.test(state.bee + state.journey)).toBe(false);
  await page.evaluate(() => window.scrollTo({ top: document.querySelector<HTMLElement>("#put-pcele")!.offsetTop + 200, behavior: "instant" }));
  await page.setViewportSize({ width: 1024, height: 768 });
  // Read after the resize has been laid out and painted, not the stale value.
  await page.waitForTimeout(600);
  const resized = await page.evaluate(() => ({
    bee: document.querySelector("#put-pcele .journey-bee")?.getAttribute("transform") ?? "",
    page: document.querySelector(".page-bee")!.getAttribute("style") ?? "",
  }));
  expect(resized.bee).toMatch(/translate\([-0-9.]+ [-0-9.]+\)/);
  expect(/NaN|undefined/.test(resized.bee + resized.page)).toBe(false);
  assertClean();
});

test("generic reveal targets animate with a nonzero transition", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  // A syntactically invalid transition declaration (e.g. a trailing comma)
  // computes to a zero-second duration and reveals appear abruptly.
  const reveal = await page.evaluate(() => {
    const node = document.querySelector<HTMLElement>(".ingredients-index li")!;
    const style = getComputedStyle(node);
    return { duration: style.transitionDuration, property: style.transitionProperty };
  });
  expect(reveal.property, "reveal animates translate").toContain("translate");
  const seconds = reveal.duration.split(",").map((part) => parseFloat(part));
  expect(Math.max(...seconds), "nonzero reveal duration").toBeGreaterThan(0);
  // ...and once revealed, the index rows settle in place (a higher-specificity
  // offset once kept them 10px low for good).
  await page.evaluate(() => document.querySelector("#sastojci")!.scrollIntoView({ block: "center", behavior: "instant" }));
  await expect
    .poll(() => page.evaluate(() => [...document.querySelectorAll(".ingredients-index li")].map((li) => getComputedStyle(li).translate)), {
      message: "index rows settle",
      timeout: 5000,
    })
    .toEqual(["0px", "0px", "0px", "0px", "0px"]);
  assertClean();
});

test("honey handoff never stacks two equal headings", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  for (const fraction of [0.265, 0.30, 0.61, 0.63]) {
    await scrollToStickyProgress(page, ".honey-harvest", fraction);
    await page.waitForTimeout(900);
    const chapters: number[] = await page.evaluate(() =>
      [".honey-harvest__chapter--a", ".honey-harvest__chapter--b", ".honey-harvest__chapter--c"].map(
        (selector) => parseFloat(document.querySelector<HTMLElement>(selector)?.style.opacity ?? "0"),
      ),
    );
    const nearEqual = chapters.filter((value) => value > 0.35 && value < 0.65).length;
    expect(nearEqual, `no equal-opacity stack at p=${fraction}`).toBeLessThan(2);
    expect(Math.max(...chapters), `dominant chapter at p=${fraction}`).toBeGreaterThan(0.45);
  }
  assertClean();
});

test("landscape honey copy clears the fixed header", async ({ page }) => {
  const assertClean = trackErrors(page);
  for (const viewport of [
    { width: 844, height: 390 },
    { width: 844, height: 430 },
    { width: 768, height: 390 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/", { waitUntil: "networkidle" });
    await scrollToStickyProgress(page, ".honey-harvest", 0.4);
    await page.waitForTimeout(900);
    const layout = await page.evaluate(() => {
      const header = document.querySelector(".site-header")!.getBoundingClientRect();
      const chapters = [".honey-harvest__chapter--a", ".honey-harvest__chapter--b", ".honey-harvest__chapter--c"].map(
        (selector) => {
          const node = document.querySelector<HTMLElement>(selector)!;
          const rect = node.getBoundingClientRect();
          return { opacity: parseFloat(node.style.opacity ?? "0"), top: rect.top, bottom: rect.bottom };
        },
      );
      const active = chapters.find((chapter) => chapter.opacity > 0.5)!;
      return { headerBottom: header.bottom, active, viewport: window.innerHeight };
    });
    expect(layout.active, `active chapter at ${viewport.width}x${viewport.height}`).toBeDefined();
    expect(layout.active.top, `chapter clears header at ${viewport.width}x${viewport.height}`).toBeGreaterThanOrEqual(
      layout.headerBottom - 1,
    );
    expect(layout.active.bottom, `chapter inside viewport at ${viewport.width}x${viewport.height}`).toBeLessThanOrEqual(
      layout.viewport + 1,
    );
  }
  assertClean();
});

test("global bee stays hidden in kontakt at small widths", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/", { waitUntil: "networkidle" });
  // The prompt's failing state: kontakt under the viewport center with page
  // progress above 0.985 — exclusion must win over the end fallback.
  await page.evaluate(() => {
    const node = document.querySelector<HTMLElement>("#kontakt")!;
    window.scrollTo({ top: node.offsetTop + node.offsetHeight / 2 - window.innerHeight * 0.48, behavior: "instant" });
  });
  await expect
    .poll(() => page.evaluate(() => parseFloat(getComputedStyle(document.querySelector(".page-bee")!).opacity)), {
      message: "bee hidden in kontakt at 320px",
      timeout: 4000,
    })
    .toBeLessThan(0.2);
  assertClean();
});

test("global bee never covers product controls or search", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await page.evaluate(() => {
    const node = document.querySelector<HTMLElement>(".catalog-panel__intro")!;
    window.scrollTo({ top: node.offsetTop + node.offsetHeight / 2 - window.innerHeight / 2, behavior: "instant" });
  });
  await page.waitForTimeout(1200);
  const collision = await page.evaluate(() => {
    const bee = document.querySelector(".page-bee")!.getBoundingClientRect();
    const overlap = (selector: string) => {
      const node = document.querySelector(selector);
      if (!node) return false;
      const rect = node.getBoundingClientRect();
      return bee.left < rect.right && rect.left < bee.right && bee.top < rect.bottom && rect.top < bee.bottom;
    };
    return {
      search: overlap(".catalog-search input"),
      tabs: overlap(".catalog-tabs"),
    };
  });
  expect(collision.search, "bee off the search field").toBe(false);
  expect(collision.tabs, "bee off the catalog tabs").toBe(false);
  assertClean();
});

test("global bee never sits on text or controls", async ({ page }) => {
  test.setTimeout(180_000);
  const assertClean = trackErrors(page);
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/", { waitUntil: "networkidle" });
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < height - viewport.height; y += Math.round(viewport.height * 0.45)) {
      await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
      await page.waitForTimeout(650);
      const hits = await page.evaluate(() => {
        const bee = document.querySelector<HTMLElement>(".page-bee")!;
        if (parseFloat(getComputedStyle(bee).opacity) <= 0.3) return [];
        const b = bee.querySelector("svg")!.getBoundingClientRect();
        return [...document.querySelectorAll<HTMLElement>("main :is(h1, h2, h3, h4, p, li, a, button, input, label, blockquote, figcaption, summary)")]
          .filter((node) => {
            const r = node.getBoundingClientRect();
            return r.width > 0 && r.height > 0 && b.left < r.right && r.left < b.right && b.top < r.bottom && r.top < b.bottom;
          })
          .map((node) => `${node.tagName}: ${(node.textContent ?? "").trim().slice(0, 30)}`);
      });
      expect(hits, `${viewport.width}x${viewport.height} at y=${y}`).toEqual([]);
    }
  }
  assertClean();
});
