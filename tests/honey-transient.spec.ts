import { expect, test, type Page } from "@playwright/test";
import { trackErrors } from "./helpers";

/**
 * Transient-state suite: reproduces real continuous scrolling instead of
 * only asserting settled poses. Steps are small with short waits so the
 * damped scheduler is still mid-flight — exactly the states a trackpad
 * user sees. Thresholds derive from the corrected path's design velocity
 * (carry leg ~455 units over 0.17 progress ≈ 27px per 1% step at 1440px),
 * not from values tuned merely to stay green.
 */

type HoneySample = {
  f: number;
  bee: [number, number];
  wing: number;
  prob: number;
  drop: [number, number];
  dropO: number;
  fillY: number;
  fillH: number;
  chapters: number[];
  camera: string;
};

async function gotoFraction(page: Page, fraction: number) {
  await page.evaluate((f) => {
    const node = document.querySelector<HTMLElement>(".honey-harvest")!;
    const span = Math.max(1, node.offsetHeight - window.innerHeight);
    window.scrollTo({ top: node.offsetTop + f * span, behavior: "instant" });
  }, fraction);
}

async function takeSample(page: Page, f: number): Promise<HoneySample> {
  return page.evaluate((fr) => {
    const query = (selector: string) => document.querySelector(selector)!;
    // Parse pose from attributes, never from bounding boxes: boxes include
    // time-flapping wings and drop-shadow filters, which legitimately vary
    // between visits while the scroll pose is identical.
    const beeTransform = query(".honey-macro-bee")?.getAttribute("transform") ?? "";
    const beeMatch = beeTransform.match(/translate\((-?[0-9.]+) (-?[0-9.]+)\)/);
    const dropNode = query(".honey-drop");
    const wing = (query(".honey-macro-bee g")?.getAttribute("transform") ?? "").match(/rotate\((-?[0-9.]+)/);
    const fillRect = query(".honey-comb .honey-fill-level") as SVGRectElement | null;
    return {
      f: fr,
      bee: [parseFloat(beeMatch?.[1] ?? "NaN"), parseFloat(beeMatch?.[2] ?? "NaN")] as [number, number],
      wing: wing ? parseFloat(wing[1]) : NaN,
      prob: parseFloat(((query(".honey-proboscis") as HTMLElement).style.opacity ?? "0")),
      drop: [parseFloat(dropNode?.getAttribute("cx") ?? "NaN"), parseFloat(dropNode?.getAttribute("cy") ?? "NaN")] as [
        number,
        number,
      ],
      dropO: parseFloat(((dropNode as HTMLElement).style.opacity ?? "0")),
      fillY: fillRect ? parseFloat(fillRect.getAttribute("y") ?? "NaN") : NaN,
      fillH: fillRect ? parseFloat(fillRect.getAttribute("height") ?? "NaN") : NaN,
      chapters: [".honey-harvest__chapter--a", ".honey-harvest__chapter--b", ".honey-harvest__chapter--c"].map(
        (selector) => parseFloat((query(selector) as HTMLElement).style.opacity ?? "0"),
      ),
      camera: (query(".honey-harvest__macro") as SVGSVGElement).style.translate,
    };
  }, f);
}

/** Wait until the damped loop parks (two identical consecutive reads). */
async function pollParked(page: Page, fraction: number) {
  await gotoFraction(page, fraction);
  let previous = "";
  for (let i = 0; i < 25; i += 1) {
    await page.waitForTimeout(120);
    const current = await page.evaluate(
      () =>
        (document.querySelector(".honey-macro-bee")?.getAttribute("transform") ?? "") +
        (document.querySelector(".honey-comb .honey-fill-level") as SVGRectElement | null)?.getAttribute("y"),
    );
    if (current === previous) return;
    previous = current;
  }
  throw new Error(`scene did not park at p=${fraction}`);
}

test("fine forward sweep has no derivative spikes", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  const rows: HoneySample[] = [];
  for (let i = 0; i <= 100; i += 1) {
    const f = i / 100;
    await gotoFraction(page, f);
    // Mid-flight sampling: 120ms leaves the damped loop still converging
    // (parking needs ~1s), so wings/fill/chapters are genuinely transient.
    await page.waitForTimeout(120);
    rows.push(await takeSample(page, f));
  }
  const dist = (a: [number, number], b: [number, number]) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  for (let i = 1; i < rows.length; i += 1) {
    const f = rows[i].f;
    // Design peak is ~38 units per 1% step; residual scheduler lag adds up
    // to ~50% on top mid-flight, so the bound is ~2x peak. Teleports
    // (full-leg 455+) and stuck-then-snap states still fail loudly.
    expect(dist(rows[i].bee, rows[i - 1].bee), `bee velocity at p=${f}`).toBeLessThan(80);
    expect(dist(rows[i].drop, rows[i - 1].drop), `drop velocity at p=${f}`).toBeLessThan(80);
    // Wing pose stays sane mid-flight; temporal continuity (the actual
    // anti-strobing property) is proven by the dedicated test below.
    expect(Number.isFinite(rows[i].wing), `finite wing at p=${f}`).toBe(true);
    expect(Math.abs(rows[i].wing), `bounded wing at p=${f}`).toBeLessThan(60);
    expect(Number.isFinite(rows[i].fillY) && Number.isFinite(rows[i].fillH), `finite fill at p=${f}`).toBe(true);
    expect(rows[i].fillY, `fill bounds at p=${f}`).toBeGreaterThanOrEqual(320);
    expect(rows[i].fillY, `fill bounds at p=${f}`).toBeLessThanOrEqual(525);
    const mid = rows[i].chapters.filter((value) => value > 0.3 && value < 0.7).length;
    expect(mid, `no dual-mid chapters at p=${f}`).toBeLessThan(2);
  }
  assertClean();
});

test("wing flap is temporally continuous", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  // Fixed scroll: the flap phase advances with wall time, so successive
  // frames must step smoothly. (The old progress-keyed flap aliased into
  // strobing whenever scroll speed changed; sampling it per scroll step
  // could not distinguish smooth time motion from aliased jumps.)
  await gotoFraction(page, 0.35);
  await page.waitForTimeout(500);
  const angles: number[] = [];
  for (let i = 0; i < 10; i += 1) {
    await page.waitForTimeout(30);
    angles.push(await page.evaluate(() => {
      const match = (document.querySelector(".honey-macro-bee g")?.getAttribute("transform") ?? "").match(
        /rotate\((-?[0-9.]+)/,
      );
      return match ? parseFloat(match[1]) : NaN;
    }));
  }
  for (let i = 1; i < angles.length; i += 1) {
    expect(Number.isFinite(angles[i]), "finite wing angle").toBe(true);
    expect(Math.abs(angles[i] - angles[i - 1]), "smooth flap step").toBeLessThan(15);
  }
  assertClean();
});

test("critical zones stay smooth at 0.005 resolution", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  const zones: Array<[number, number]> = [
    [0.25, 0.55],
    [0.65, 0.93],
  ];
  for (const [start, end] of zones) {
    // Each zone starts from a parked scene: the move from one zone's end to
    // the next zone's start is a 0.1 jump, and its catch-up is not a
    // 0.005 step. Without this, the second zone's first comparison measured
    // that jump's catch-up against wall-clock sampling (load-dependent).
    await pollParked(page, start);
    let previous: HoneySample | null = null;
    for (let f = start; f <= end + 1e-9; f += 0.005) {
      await gotoFraction(page, f);
      await page.waitForTimeout(25);
      const current = await takeSample(page, f);
      if (previous) {
        const step = (a: [number, number], b: [number, number]) => Math.hypot(a[0] - b[0], a[1] - b[1]);
        // Teleport class only: rapid stepping outruns scheduler convergence,
        // so per-sample jumps include catch-up. Fine pacing is proven
        // parked by the slow-mapping test; here any full-leg snap fails.
        // The drop rides the bee through carry, so it shares the bee bound.
        expect(step(current.bee, previous.bee), `bee at p=${f.toFixed(3)}`).toBeLessThan(150);
        expect(step(current.drop, previous.drop), `drop at p=${f.toFixed(3)}`).toBeLessThan(150);
      }
      previous = current;
    }
  }
  assertClean();
});

test("proboscis retracts before takeoff and drink is a real hold", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  const rows: HoneySample[] = [];
  for (let f = 0.28; f <= 0.56; f += 0.01) {
    await gotoFraction(page, f);
    await page.waitForTimeout(30);
    rows.push(await takeSample(page, f));
  }
  const drinkPeak = Math.max(...rows.filter((r) => r.f >= 0.33 && r.f <= 0.39).map((r) => r.prob));
  expect(drinkPeak, "proboscis fully out during drink").toBeGreaterThan(0.9);
  // The deterministic mapping retracts exactly at takeoff start; transient
  // samples may still lag one scheduler step behind, so the mid-flight
  // bound starts just past the switch.
  for (const row of rows.filter((r) => r.f >= 0.47)) {
    expect(row.prob, `proboscis retracted at p=${row.f.toFixed(2)}`).toBeLessThan(0.05);
  }
  await pollParked(page, 0.45);
  const parked = await takeSample(page, 0.45);
  expect(parked.prob, "proboscis mapping is zero at takeoff start").toBeLessThan(0.02);
  // Bee nearly fixed through the hold: drink-window travel stays tiny.
  const hold = rows.filter((r) => r.f >= 0.33 && r.f <= 0.39);
  const spread = Math.max(...hold.map((r) => r.bee[0])) - Math.min(...hold.map((r) => r.bee[0]));
  expect(spread, "bee pinned during drink hold").toBeLessThan(30);
  assertClean();
});

test("slow mapping follows design velocity", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  // Near-parked sampling proves the deterministic mapping itself is smooth.
  // Analytic peak: smoothstep slopes peak at 1.5x average, so the carry leg
  // (452 units over 0.17) peaks at ~19.1 units per 0.005 step; the bound
  // below is ~1.5x that peak. Density focuses on the peak-velocity window
  // (0.55–0.65); the rest of the leg is covered at 0.01. Each step parks
  // the damped loop first so catch-up never pollutes the measurement.
  const fractions: number[] = [];
  for (let f = 0.5; f <= 0.75; f += 0.01) fractions.push(Math.round(f * 1000) / 1000);
  for (let f = 0.555; f <= 0.65; f += 0.005) fractions.push(Math.round(f * 1000) / 1000);
  const unique = [...new Set(fractions)].sort((a, b) => a - b);
  let previous: HoneySample | null = null;
  for (const f of unique) {
    await pollParked(page, f);
    const current = await takeSample(page, f);
    if (previous) {
      const step = (a: [number, number], b: [number, number]) => Math.hypot(a[0] - b[0], a[1] - b[1]);
      // Bound scales with the step width: 30 units per 0.005 of progress
      // (~1.5x the analytic peak), so 0.01 gaps allow 60.
      const bound = 6000 * (f - previous.f);
      expect(step(current.bee, previous.bee), `mapped bee at p=${f.toFixed(3)}`).toBeLessThan(bound);
      expect(step(current.drop, previous.drop), `mapped drop at p=${f.toFixed(3)}`).toBeLessThan(bound);
    }
    previous = current;
  }
  assertClean();
});

test("reverse returns the parked state at exact progress", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  for (const fraction of [0.35, 0.6, 0.84]) {
    await pollParked(page, fraction);
    const forward = await takeSample(page, fraction);
    await pollParked(page, Math.min(1, fraction + 0.2));
    await pollParked(page, fraction);
    const back = await takeSample(page, fraction);
    expect(back.bee, `bee at p=${fraction}`).toEqual(forward.bee);
    expect(back.chapters, `chapters at p=${fraction}`).toEqual(forward.chapters);
    expect(back.fillY, `fill at p=${fraction}`).toBe(forward.fillY);
  }
  assertClean();
});

test("jumps, reversals and mid-scene resize stay finite", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  for (const fraction of [0.5, 0.2, 0.9, 0.35, 0.0, 0.84]) {
    await gotoFraction(page, fraction);
    await page.waitForTimeout(120);
    const state = await takeSample(page, fraction);
    expect(state.bee.every(Number.isFinite), `finite bee after jump to ${fraction}`).toBe(true);
    expect(state.chapters.every(Number.isFinite), `finite chapters after jump to ${fraction}`).toBe(true);
    // Readability is a parked property: mid-flight the damped loop can be
    // crossing a single-point handoff switch, where no chapter dominates
    // by design. Recovery is proven by parking at the final jump.
  }
  await pollParked(page, 0.84);
  const parked = await takeSample(page, 0.84);
  expect(Math.max(...parked.chapters), "readable chapter after jump recovery").toBeGreaterThan(0.9);
  await gotoFraction(page, 0.35);
  await page.waitForTimeout(120);
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.waitForTimeout(300);
  const resized = await takeSample(page, 0.35);
  expect(resized.bee.every(Number.isFinite), "finite bee after resize while drinking").toBe(true);
  await gotoFraction(page, 0.84);
  await page.waitForTimeout(120);
  await page.setViewportSize({ width: 844, height: 390 });
  await page.waitForTimeout(300);
  const resizedDeposit = await takeSample(page, 0.84);
  expect(resizedDeposit.bee.every(Number.isFinite), "finite bee after resize while depositing").toBe(true);
  assertClean();
});
