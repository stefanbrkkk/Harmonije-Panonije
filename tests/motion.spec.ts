import { expect, test } from "@playwright/test";
import { scrollToStickyProgress, trackErrors } from "./helpers";

const honeyPoints: Array<[fraction: number, minDominant: number]> = [
  // Resting positions: one fully dominant chapter.
  [0, 0.9],
  [0.18, 0.9],
  [0.3, 0.9],
  [0.45, 0.9],
  [0.55, 0.9],
  [0.72, 0.9],
  [0.85, 0.9],
  [1, 0.9],
  // Handoff midpoints: brief symmetric crossfade (worst instant 0.5/0.5,
  // never faint). The bar stays well above any near-zero trough.
  [0.355, 0.45],
  [0.635, 0.45],
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

test("HoneyHarvest geometry stays sane", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await scrollToStickyProgress(page, ".honey-harvest", 0.42);
  await page.waitForTimeout(900);
  const geometry = await page.evaluate(() => {
    const svg = document.querySelector<SVGSVGElement>(".honey-harvest__macro")!;
    const point = svg.createSVGPoint();
    const matrix = svg.getScreenCTM()!;
    const toPx = (x: number, y: number) => {
      point.x = x;
      point.y = y;
      return point.matrixTransform(matrix);
    };
    const flower = toPx(106, 242);
    const bee = document.querySelector(".honey-macro-bee")!.getBoundingClientRect();
    const center = { x: bee.x + bee.width / 2, y: bee.y + bee.height / 2 };
    const transforms = [...document.querySelectorAll(".honey-macro-bee, #put-pcele .scene-bee, .page-bee")]
      .map((node) => node.getAttribute("transform") ?? (node as HTMLElement).style.transform)
      .join(" ");
    return {
      meet: Math.hypot(flower.x - center.x, flower.y - center.y),
      nan: /NaN|undefined/.test(transforms),
    };
  });
  expect(geometry.meet, "bee meets flower head").toBeLessThan(120);
  expect(geometry.nan, "no invalid transforms").toBe(false);
  assertClean();
});

test("mobile honey keeps the action framed", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });
  for (const fraction of [0.1, 0.3, 0.5, 0.7, 0.9]) {
    await scrollToStickyProgress(page, ".honey-harvest", fraction);
    await page.waitForTimeout(800);
    const visible = await page.evaluate(() => {
      const viewport = window.innerWidth;
      const share = (selector: string) => {
        const rect = document.querySelector(selector)!.getBoundingClientRect();
        return (Math.min(rect.right, viewport) - Math.max(rect.left, 0)) / Math.max(1, rect.width);
      };
      return { flower: share(".honey-flower"), bee: share(".honey-macro-bee") };
    });
    expect(visible.flower > 0.5 || visible.bee > 0.5, `framed action at p=${fraction}`).toBe(true);
  }
  assertClean();
});

test("BeeJourney ends with bee, house and outro framed", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await scrollToStickyProgress(page, "#put-pcele", 1);
  await page.waitForTimeout(900);
  const end = await page.evaluate(() => {
    const inFrame = (selector: string) => {
      const rect = document.querySelector(selector)!.getBoundingClientRect();
      return rect.width > 10 && rect.bottom > 0 && rect.top < window.innerHeight;
    };
    return {
      bee: (document.querySelector("#put-pcele .scene-bee")?.getAttribute("transform") ?? "").length > 10,
      house: parseFloat(document.querySelector<HTMLElement>(".scene-house")?.style.opacity ?? "0"),
      outro: inFrame(".bee-journey__outro"),
    };
  });
  expect(end.bee).toBe(true);
  expect(end.house).toBeGreaterThan(0.9);
  expect(end.outro).toBe(true);
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
    journey: document.querySelector("#put-pcele .scene-bee")?.getAttribute("transform") ?? "",
  }));
  expect(/NaN|undefined/.test(state.bee + state.journey)).toBe(false);
  await page.evaluate(() => window.scrollTo({ top: document.querySelector<HTMLElement>("#put-pcele")!.offsetTop + 200, behavior: "instant" }));
  await page.setViewportSize({ width: 1024, height: 768 });
  const resized = await page.evaluate(
    () => document.querySelector("#put-pcele .scene-bee")?.getAttribute("transform") ?? "",
  );
  expect(resized).toMatch(/translate\([-0-9.]+ [-0-9.]+\)/);
  assertClean();
});
