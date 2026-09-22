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
        const attrs = [...document.querySelectorAll(".honey-macro-bee, .honey-flower, .honey-drop, .honey-stream, .honey-comb")]
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
    // Bee flight between adjacent 0.05 steps stays plausible; the carry
    // peaks at ~190 units per 0.05 step (452 units over 0.17 with
    // smoothstep's 1.5x peak slope), so the bound is ~1.4x peak. Fine
    // pacing is proven parked by the transient suite's slow mapping.
    expect(step(samples[i].bee, samples[i - 1].bee), `bee plausible near p=${i / 20}`).toBeLessThan(270);
    // The drop rides the bee through carry, sharing its peak velocity.
    expect(step(samples[i].drop, samples[i - 1].drop), `drop continuous near p=${i / 20}`).toBeLessThan(270);
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
  // Reverse scroll recovers the identical pose: store the forward pose
  // before reversing, then compare the recovered pose against it.
  const fwd = await page.evaluate(() => document.querySelector(".honey-macro-bee")?.getAttribute("transform") ?? "");
  const fwdChapters: number[] = await page.evaluate(() =>
    [".honey-harvest__chapter--a", ".honey-harvest__chapter--b", ".honey-harvest__chapter--c"].map(
      (selector) => parseFloat(document.querySelector<HTMLElement>(selector)?.style.opacity ?? "0"),
    ),
  );
  await scrollToStickyProgress(page, ".honey-harvest", 0.8);
  await page.waitForTimeout(900);
  await scrollToStickyProgress(page, ".honey-harvest", 0.365);
  await page.waitForTimeout(900);
  const back = await page.evaluate(() => document.querySelector(".honey-macro-bee")?.getAttribute("transform") ?? "");
  const backChapters: number[] = await page.evaluate(() =>
    [".honey-harvest__chapter--a", ".honey-harvest__chapter--b", ".honey-harvest__chapter--c"].map(
      (selector) => parseFloat(document.querySelector<HTMLElement>(selector)?.style.opacity ?? "0"),
    ),
  );
  expect(back, "reverse recovers drink pose").toBe(fwd);
  expect(backChapters, "reverse recovers drink chapters").toEqual(fwdChapters);
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
  // Single numbering system lives on the SVG landmarks; the caption carries
  // the stage description only.
  const expected = [
    "Cvet i voće — početak puta",
    "Med i bilje — darovi livade",
    "Zlatna kap — craft u nastajanju",
    "Panonija — dom sa etikete",
  ];
  for (const [fraction, stage] of [[0.1, 0], [0.4, 1], [0.6, 2], [0.85, 3]] as Array<[number, number]>) {
    await scrollToStickyProgress(page, "#put-pcele", fraction);
    await page.waitForTimeout(800);
    const caption = await page.evaluate(() => ({
      text: document.querySelector(".bee-journey__caption p")?.textContent,
      opacity: parseFloat(document.querySelector<HTMLElement>(".bee-journey__caption")?.style.opacity ?? "0"),
    }));
    expect(caption.text, `stage at p=${fraction}`).toBe(expected[stage]);
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

test("generic reveal targets animate with a nonzero transition", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  // A syntactically invalid transition declaration (e.g. a trailing comma)
  // computes to a zero-second duration and reveals appear abruptly.
  const reveal = await page.evaluate(() => {
    const node = document.querySelector<HTMLElement>(".ingredient-card")!;
    const style = getComputedStyle(node);
    return { duration: style.transitionDuration, property: style.transitionProperty };
  });
  expect(reveal.property, "reveal animates translate").toContain("translate");
  const seconds = reveal.duration.split(",").map((part) => parseFloat(part));
  expect(Math.max(...seconds), "nonzero reveal duration").toBeGreaterThan(0);
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

test("honey stream meets the comb at the deposit state", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 1280, height: 720 },
  ]) {
    await page.setViewportSize(viewport);
    await scrollToStickyProgress(page, ".honey-harvest", 0.85);
    await page.waitForTimeout(900);
    // Canonical coordinates: project the stream endpoint (588,366) and
    // the comb surface line through the same SVG CTM and compare.
    const gap = await page.evaluate(() => {
      const svg = document.querySelector<SVGSVGElement>(".honey-harvest__macro")!;
      const matrix = svg.getScreenCTM()!;
      const point = svg.createSVGPoint();
      const project = (x: number, y: number) => {
        point.x = x;
        point.y = y;
        return point.matrixTransform(matrix).y;
      };
      const streamEnd = project(588, 366);
      // Surface line from (492,372) to (800,332).
      const surface = project(588, 372 - ((588 - 492) * 40) / 308);
      return streamEnd - surface;
    });
    // The stream terminates at/pours into the surface (small positive
    // overlap reads as pouring in; drop-shadow adds a few px to rects).
    expect(gap, `stream-to-surface at ${viewport.width}x${viewport.height}`).toBeGreaterThan(-4);
    expect(gap, `stream-to-surface at ${viewport.width}x${viewport.height}`).toBeLessThan(14);
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

test("journey caption never collides with the intro", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await scrollToStickyProgress(page, "#put-pcele", 0.02);
  await page.waitForTimeout(800);
  const boxes = await page.evaluate(() => {
    const rect = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
    const caption = rect(".bee-journey__caption");
    const intro = rect(".bee-journey__intro");
    const outro = rect(".bee-journey__outro");
    return {
      captionTop: caption.top,
      captionBottom: caption.bottom,
      introBottom: intro.bottom,
      outroTop: outro.top,
    };
  });
  expect(boxes.captionTop, "caption below intro").toBeGreaterThanOrEqual(boxes.introBottom - 1);
  expect(boxes.captionBottom, "caption above outro").toBeLessThanOrEqual(boxes.outroTop + 1);
  assertClean();
});

test("journey caption content clears artwork and outro", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await scrollToStickyProgress(page, "#put-pcele", 1);
  await page.waitForTimeout(800);
  const boxes = await page.evaluate(() => {
    const rect = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
    const caption = rect(".bee-journey__caption p");
    const flower = rect(".scene-ingredient--bloom");
    const outro = rect(".bee-journey__outro");
    const overlaps = (a: DOMRect, b: DOMRect) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
    return {
      captionFlower: overlaps(caption, flower),
      captionOutro: overlaps(caption, outro),
    };
  });
  expect(boxes.captionFlower, "caption off the flower artwork").toBe(false);
  expect(boxes.captionOutro, "caption off the outro").toBe(false);
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

test("mobile drink framing keeps flower and bee visible", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });
  await scrollToStickyProgress(page, ".honey-harvest", 0.365);
  await page.waitForTimeout(900);
  const framing = await page.evaluate(() => {
    const viewport = window.innerWidth;
    const rect = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
    const flower = rect(".honey-flower");
    const bee = rect(".honey-macro-bee");
    const share = (r: DOMRect) => (Math.min(r.right, viewport) - Math.max(r.left, 0)) / Math.max(1, r.width);
    return { flowerLeft: flower.left, flowerShare: share(flower), beeShare: share(bee) };
  });
  // Shot-based framing: the flower stays essentially in frame (tiny edge
  // bleed is intentional camera work) and the bee is fully visible.
  expect(framing.flowerLeft, "flower at the left edge, not lost").toBeGreaterThanOrEqual(-12);
  expect(framing.flowerShare, "flower visible share").toBeGreaterThan(0.9);
  expect(framing.beeShare, "bee visible share").toBeGreaterThan(0.9);
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
