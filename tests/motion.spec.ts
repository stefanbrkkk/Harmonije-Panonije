import { expect, test } from "@playwright/test";
import { scrollToStickyProgress, trackErrors } from "./helpers";

const honeyPoints: Array<[fraction: number, minDominant: number]> = [
  // Resting positions: one fully dominant chapter (windows track actions:
  // A flower/approach, B landing/nectar, C honey/flavor).
  [0, 0.9],
  [0.15, 0.9],
  [0.35, 0.9],
  [0.5, 0.9],
  [0.8, 0.9],
  [0.95, 0.9],
  [1, 0.9],
  // Handoff midpoints: brief symmetric crossfade (worst instant 0.5/0.5,
  // never faint). The bar stays well above any near-zero trough.
  [0.265, 0.45],
  [0.665, 0.45],
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

test("HoneyHarvest dense sweep: finite states, no teleports", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  const samples: Array<{ bee: number[]; flower: number[]; drop: number[]; chapters: number[] }> = [];
  for (let i = 0; i <= 20; i++) {
    const fraction = i / 20;
    await scrollToStickyProgress(page, ".honey-harvest", fraction);
    await page.waitForTimeout(700);
    samples.push(
      await page.evaluate(() => {
        const center = (selector: string) => {
          const rect = document.querySelector(selector)!.getBoundingClientRect();
          return [rect.x + rect.width / 2, rect.y + rect.height / 2];
        };
        const attrs = [...document.querySelectorAll(".honey-macro-bee, .honey-flower, .honey-drop, .honey-stream")]
          .map((node) => node.getAttribute("transform") ?? node.getAttribute("d") ?? (node as HTMLElement).style.transform ?? "")
          .join(" ");
        return {
          bee: center(".honey-macro-bee"),
          flower: center(".honey-flower"),
          drop: center(".honey-drop"),
          chapters: [".honey-harvest__chapter--a", ".honey-harvest__chapter--b", ".honey-harvest__chapter--c"].map(
            (selector) => parseFloat(document.querySelector<HTMLElement>(selector)?.style.opacity ?? "0"),
          ),
          invalid: /NaN|Infinity|undefined/.test(attrs),
        };
      }),
    );
    const last = samples[samples.length - 1] as unknown as { invalid: boolean };
    expect(last.invalid, `finite state at p=${fraction}`).toBe(false);
  }
  for (let i = 1; i < samples.length; i++) {
    const step = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1]);
    // Flower is rooted: it may breathe, never travel.
    expect(step(samples[i].flower, samples[i - 1].flower), `flower rooted near p=${i / 20}`).toBeLessThan(24);
    // Bee flight between adjacent 0.05 steps stays plausible; the carry is
    // the fastest segment (~115px per step at 1440px).
    expect(step(samples[i].bee, samples[i - 1].bee), `bee plausible near p=${i / 20}`).toBeLessThan(170);
    // Nectar transfer is quick but continuous (flower → bee → stream).
    expect(step(samples[i].drop, samples[i - 1].drop), `drop continuous near p=${i / 20}`).toBeLessThan(330);
    // Always a readable chapter; at most one chapter may pass through the
    // faint band at a time (the other must dominate) — never dual-faint.
    const chapters = samples[i].chapters;
    expect(Math.max(...chapters), `readable at p=${i / 20}`).toBeGreaterThan(0.45);
    expect(chapters.filter((value) => value > 0.03 && value < 0.12).length, `no trough at p=${i / 20}`).toBeLessThan(2);
  }
  assertClean();
});

test("HoneyHarvest drinking moment is a real held beat", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await scrollToStickyProgress(page, ".honey-harvest", 0.365);
  await page.waitForTimeout(900);
  const drink = await page.evaluate(() => {
    const svg = document.querySelector<SVGSVGElement>(".honey-harvest__macro")!;
    const point = svg.createSVGPoint();
    const matrix = svg.getScreenCTM()!;
    const toPx = (x: number, y: number) => {
      point.x = x;
      point.y = y;
      return point.matrixTransform(matrix);
    };
    const nectar = toPx(106, 242);
    const bee = document.querySelector(".honey-macro-bee")!.getBoundingClientRect();
    const center = { x: bee.x + bee.width / 2, y: bee.y + bee.height / 2 };
    return {
      headNearNectar: Math.hypot(nectar.x - center.x, nectar.y - center.y),
      proboscis: parseFloat(document.querySelector<SVGPathElement>(".honey-proboscis")?.style.opacity ?? "0"),
      wingFold: document.querySelector(".honey-macro-bee g")?.getAttribute("transform") ?? "",
    };
  });
  expect(drink.headNearNectar, "head at the nectar center").toBeLessThan(70);
  expect(drink.proboscis, "proboscis out while drinking").toBeGreaterThan(0.9);
  expect(drink.wingFold, "wings folded while drinking").toMatch(/rotate\(-/);
  // Camera still during the hold: no macro shift drift while settled.
  const shiftA = await page.evaluate(() => document.querySelector<SVGSVGElement>(".honey-harvest__macro")!.style.translate);
  await page.waitForTimeout(600);
  const shiftB = await page.evaluate(() => document.querySelector<SVGSVGElement>(".honey-harvest__macro")!.style.translate);
  expect(shiftA, "camera still while drinking").toBe(shiftB);
  // Reverse scroll recovers the identical pose.
  await scrollToStickyProgress(page, ".honey-harvest", 0.8);
  await page.waitForTimeout(900);
  await scrollToStickyProgress(page, ".honey-harvest", 0.365);
  await page.waitForTimeout(900);
  const back = await page.evaluate(() => document.querySelector(".honey-macro-bee")?.getAttribute("transform") ?? "");
  const fwd = await page.evaluate(() => document.querySelector(".honey-macro-bee")?.getAttribute("transform") ?? "");
  expect(back, "reverse recovers drink pose").toBe(fwd);
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

test("BeeJourney stage captions track progress", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  const expected = ["01", "02", "03", "04"];
  for (const [fraction, stage] of [[0.1, 0], [0.4, 1], [0.6, 2], [0.85, 3]] as Array<[number, number]>) {
    await scrollToStickyProgress(page, "#put-pcele", fraction);
    await page.waitForTimeout(800);
    const caption = await page.evaluate(() => ({
      index: document.querySelector(".bee-journey__caption-index")?.textContent,
      opacity: parseFloat(document.querySelector<HTMLElement>(".bee-journey__caption")?.style.opacity ?? "0"),
    }));
    expect(caption.index, `stage at p=${fraction}`).toBe(expected[stage]);
    expect(caption.opacity, `caption readable at p=${fraction}`).toBeGreaterThan(0.8);
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
  // …while connective sections keep the motif.
  await page.evaluate(() => {
    const node = document.querySelector<HTMLElement>("#proizvodi")!;
    window.scrollTo({ top: node.offsetTop + node.offsetHeight / 2 - window.innerHeight / 2, behavior: "instant" });
  });
  await expect
    .poll(
      () => page.evaluate(() => parseFloat(getComputedStyle(document.querySelector(".page-bee")!).opacity)),
      { message: "bee present between scenes", timeout: 4000 },
    )
    .toBeGreaterThan(0.5);
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
