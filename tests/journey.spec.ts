import { expect, type Page, test } from "@playwright/test";
import { scrollToStickyProgress, trackErrors } from "./helpers";

/*
 * BeeJourney: four chapters on one horizon. Each scroll position must show
 * exactly one finished chapter (word, lead, plate, index state), text must
 * never collide with artwork, and every scroll pattern (slow, reverse,
 * jumps, resize) must settle on the chapter the position maps to.
 */

type Snapshot = {
  live: boolean;
  active: number[];
  activePlates: number[];
  plateOpacity: number[];
  index: number[];
  wordVisible: boolean;
  bee: string;
};

async function snapshot(page: Page): Promise<Snapshot> {
  return page.evaluate(() => {
    const section = document.querySelector<HTMLElement>("#put-pcele")!;
    const chapters = [...section.querySelectorAll<HTMLElement>("[data-chapter]")];
    const plates = [...section.querySelectorAll<SVGGElement>("[data-plate]")];
    const indexItems = [...section.querySelectorAll<HTMLElement>("[data-index]")];
    const active = chapters.flatMap((node, i) => (node.classList.contains("is-active") ? [i] : []));
    let wordVisible = false;
    if (active.length === 1) {
      const word = chapters[active[0]].querySelector(".journey__word")!;
      const clip = word.getBoundingClientRect();
      const text = word.querySelector("span")!.getBoundingClientRect();
      wordVisible = text.top >= clip.top - 1 && text.bottom <= clip.bottom + 1 && text.height > 20;
    }
    return {
      live: section.classList.contains("is-live"),
      active,
      activePlates: plates.flatMap((node, i) => (node.classList.contains("is-active") ? [i] : [])),
      plateOpacity: plates.map((node) => parseFloat(getComputedStyle(node).opacity)),
      index: indexItems.flatMap((node, i) => (node.classList.contains("is-active") ? [i] : [])),
      wordVisible,
      bee: section.querySelector(".journey-bee")?.getAttribute("transform") ?? "",
    };
  });
}

async function expectChapter(page: Page, chapter: number, label: string) {
  // Chapter swaps are time-animated (≤ ~1.2s); poll for the settled state.
  await expect
    .poll(async () => {
      const s = await snapshot(page);
      return (
        s.live &&
        s.active.length === 1 &&
        s.active[0] === chapter &&
        s.activePlates.join() === String(chapter) &&
        s.index.join() === String(chapter) &&
        s.wordVisible &&
        s.plateOpacity[chapter] > 0.98 &&
        s.plateOpacity.filter((value, i) => i !== chapter && value > 0.02).length === 0
      );
    }, { message: `${label}: settled on chapter ${chapter + 1}`, timeout: 5000 })
    .toBe(true);
  const s = await snapshot(page);
  expect(s.bee, `${label}: finite bee pose`).toMatch(/^translate\([-0-9.]+ [-0-9.]+\) rotate\([-0-9.]+\)$/);
}

test("one finished chapter at every checkpoint (1440×900)", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });
  const plan: Array<[number, number]> = [[0, 0], [0.15, 0], [0.3, 1], [0.45, 1], [0.55, 2], [0.7, 2], [0.9, 3], [1, 3]];
  for (const [fraction, chapter] of plan) {
    await scrollToStickyProgress(page, "#put-pcele", fraction);
    await expectChapter(page, chapter, `p=${fraction}`);
  }
  // Exactly on a boundary either neighbour is valid, but never zero or two.
  await scrollToStickyProgress(page, "#put-pcele", 0.5);
  await page.waitForTimeout(1400);
  const boundary = await snapshot(page);
  expect(boundary.active.length, "one chapter on the 0.5 boundary").toBe(1);
  expect([1, 2]).toContain(boundary.active[0]);
  assertClean();
});

test("reverse, jumps and interrupted flights settle on the mapped chapter", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });
  await scrollToStickyProgress(page, "#put-pcele", 1);
  await expectChapter(page, 3, "jump to end");
  await scrollToStickyProgress(page, "#put-pcele", 0);
  await expectChapter(page, 0, "jump back to start");
  // Interrupt a chapter swap and the bee's flight mid-way, then reverse.
  await scrollToStickyProgress(page, "#put-pcele", 0.4);
  await page.waitForTimeout(180);
  await scrollToStickyProgress(page, "#put-pcele", 0.95);
  await page.waitForTimeout(220);
  await scrollToStickyProgress(page, "#put-pcele", 0.6);
  await expectChapter(page, 2, "interrupted reverse");
  // Rapid wheel-like sweep in both directions.
  for (let f = 0; f <= 1.0001; f += 0.05) {
    await scrollToStickyProgress(page, "#put-pcele", f);
    await page.waitForTimeout(16);
  }
  await expectChapter(page, 3, "fast forward sweep");
  for (let f = 1; f >= -0.0001; f -= 0.05) {
    await scrollToStickyProgress(page, "#put-pcele", Math.max(0, f));
    await page.waitForTimeout(16);
  }
  await expectChapter(page, 0, "fast reverse sweep");
  // The bee comes to rest once the flight completes.
  await page.waitForTimeout(1300);
  const a = (await snapshot(page)).bee;
  await page.waitForTimeout(400);
  const b = (await snapshot(page)).bee;
  expect(b, "bee at rest after settling").toBe(a);
  assertClean();
});

test("jumps and sweeps never flash the skipped chapters' words", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });
  const to = (fraction: number) =>
    page.evaluate((f) => {
      const section = document.querySelector<HTMLElement>("#put-pcele")!;
      window.scrollTo({ top: section.offsetTop + f * (section.offsetHeight - window.innerHeight), behavior: "instant" });
    }, fraction);
  // Per frame, how much of each word's slot its glyphs cover.
  const record = () =>
    page.evaluate(() => {
      const w = window as unknown as { wordPeak: number[]; wordDone: boolean; crowded: number };
      w.wordPeak = [0, 0, 0, 0];
      w.wordDone = false;
      w.crowded = 0;
      const words = [...document.querySelectorAll<HTMLElement>("#put-pcele .journey__word")];
      const start = performance.now();
      const tick = () => {
        let inSlot = 0;
        words.forEach((word, i) => {
          const slot = word.getBoundingClientRect();
          const glyphs = word.firstElementChild!.getBoundingClientRect();
          const cover = Math.max(0, Math.min(slot.bottom, glyphs.bottom) - Math.max(slot.top, glyphs.top)) / slot.height;
          w.wordPeak[i] = Math.max(w.wordPeak[i], cover);
          if (cover > 0.3) inSlot += 1;
        });
        if (inSlot > 1) w.crowded += 1;
        if (performance.now() - start < 2400) requestAnimationFrame(tick);
        else w.wordDone = true;
      };
      requestAnimationFrame(tick);
    });
  const peaks = async () => {
    await page.waitForFunction(() => (window as unknown as { wordDone: boolean }).wordDone);
    return page.evaluate(() => (window as unknown as { wordPeak: number[] }).wordPeak);
  };

  // Instant jump across two chapters, forward and back.
  await to(0.02);
  await expectChapter(page, 0, "start at Priroda");
  await record();
  await to(0.9);
  expect((await peaks()).slice(1, 3), "Sastojci/Craft stay out of the slot on 0→3").toEqual([0, 0]);
  await record();
  await to(0.02);
  expect((await peaks()).slice(1, 3), "Sastojci/Craft stay out of the slot on 3→0").toEqual([0, 0]);

  // Scrollbar-drag sweep: many instant steps, one per frame.
  await expectChapter(page, 0, "back at Priroda");
  await record();
  for (let i = 1; i <= 30; i += 1) {
    await to(i / 30);
    await page.waitForTimeout(16);
  }
  // Chapters active for a moment may show their word; two words may never
  // share the slot (the stacked, unreadable type of a flash-through).
  await peaks();
  expect(await page.evaluate(() => (window as unknown as { crowded: number }).crowded), "frames with two words in the slot").toBe(0);
  await expectChapter(page, 3, "sweep settles on Panonija");
  assertClean();
});

test("hysteresis: boundary jitter never toggles chapters", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });
  await scrollToStickyProgress(page, "#put-pcele", 0.2);
  await expectChapter(page, 0, "before boundary");
  const seen = new Set<number>();
  for (const f of [0.254, 0.247, 0.256, 0.245, 0.253]) {
    await scrollToStickyProgress(page, "#put-pcele", f);
    await page.waitForTimeout(120);
    (await snapshot(page)).active.forEach((i) => seen.add(i));
  }
  expect([...seen], "jitter inside the hysteresis band keeps chapter 1").toEqual([0]);
  await scrollToStickyProgress(page, "#put-pcele", 0.28);
  await expectChapter(page, 1, "past the band");
  await scrollToStickyProgress(page, "#put-pcele", 0.246);
  await page.waitForTimeout(400);
  expect((await snapshot(page)).active, "reverse jitter keeps chapter 2").toEqual([1]);
  assertClean();
});

const viewports = [
  { width: 1440, height: 900 },
  { width: 1280, height: 800 },
  { width: 1024, height: 768 },
  { width: 768, height: 1024 },
  { width: 430, height: 932 },
  { width: 390, height: 844 },
  { width: 360, height: 800 },
  { width: 320, height: 568 },
  { width: 844, height: 390 },
];

test("text, artwork, bee and index never collide at any viewport", async ({ page }) => {
  test.setTimeout(240_000);
  const assertClean = trackErrors(page);
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto("/", { waitUntil: "networkidle" });
    for (const [fraction, chapter] of [[0.1, 0], [0.38, 1], [0.62, 2], [0.95, 3]] as Array<[number, number]>) {
      await scrollToStickyProgress(page, "#put-pcele", fraction);
      await expectChapter(page, chapter, `${viewport.width}x${viewport.height} p=${fraction}`);
      await page.waitForTimeout(1300);
      const hits = await page.evaluate((chapter) => {
        type Box = { left: number; top: number; right: number; bottom: number };
        const union = (rects: DOMRect[]): Box | null =>
          rects
            .filter((r) => r.width > 0 && r.height > 0)
            .reduce<Box | null>((a, r) => (a ? { left: Math.min(a.left, r.left), top: Math.min(a.top, r.top), right: Math.max(a.right, r.right), bottom: Math.max(a.bottom, r.bottom) } : { left: r.left, top: r.top, right: r.right, bottom: r.bottom }), null);
        const overlaps = (a: Box | null, b: Box | null, pad = 1) =>
          !!a && !!b && a.left < b.right - pad && b.left < a.right - pad && a.top < b.bottom - pad && b.top < a.bottom - pad;
        const section = document.querySelector<HTMLElement>("#put-pcele")!;
        const node = section.querySelector<HTMLElement>(`[data-chapter="${chapter}"]`)!;
        const textBox = (el: Element) => {
          const range = document.createRange();
          range.selectNodeContents(el);
          return union([...range.getClientRects()]);
        };
        const word = textBox(node.querySelector(".journey__word span")!);
        const lead = textBox(node.querySelector(".journey__lead")!);
        // Content shapes only: soft washes and the sun are backdrop.
        const art = union(
          [...section.querySelectorAll(`[data-plate="${chapter}"] :is(path, circle, ellipse, rect, text)`)]
            .filter((el) => !el.matches(".jart-wash, .jart-sun"))
            .map((el) => el.getBoundingClientRect()),
        );
        const bee = union([section.querySelector(".journey-bee__bob")!.getBoundingClientRect()]);
        const index = union([section.querySelector(".journey__index")!.getBoundingClientRect()]);
        const header = document.querySelector(".site-header")!.getBoundingClientRect();
        const bar = document.querySelector<HTMLElement>(".mobile-order-bar");
        const barBox = bar && getComputedStyle(bar).display !== "none" ? union([bar.getBoundingClientRect()]) : null;
        const found: string[] = [];
        if (overlaps(word, art, 2)) found.push("word×art");
        if (overlaps(lead, art, 2)) found.push("lead×art");
        if (overlaps(word, bee, 0)) found.push("word×bee");
        if (overlaps(lead, bee, 0)) found.push("lead×bee");
        if (overlaps(word, lead, 0)) found.push("word×lead");
        if (overlaps(index, art, 2)) found.push("index×art");
        if (lead && lead.top < header.bottom) found.push("lead under header");
        if (art && art.top < header.bottom - 1) found.push("art under header");
        if (index && index.bottom > window.innerHeight) found.push("index below fold");
        if (overlaps(index, barBox, 0)) found.push("index×order bar");
        if (art && (art.left < -1 || art.right > document.documentElement.clientWidth + 1)) found.push("art off-screen");
        if (document.documentElement.scrollWidth > document.documentElement.clientWidth) found.push("horizontal overflow");
        return found;
      }, chapter);
      expect(hits, `${viewport.width}x${viewport.height} chapter ${chapter + 1}`).toEqual([]);
    }
  }
  assertClean();
});

test("resize mid-scene keeps the chapter and a valid layout", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });
  await scrollToStickyProgress(page, "#put-pcele", 0.62);
  await expectChapter(page, 2, "before resize");
  for (const viewport of [{ width: 390, height: 844 }, { width: 1024, height: 768 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(viewport);
    await scrollToStickyProgress(page, "#put-pcele", 0.62);
    await expectChapter(page, 2, `after resize to ${viewport.width}x${viewport.height}`);
  }
  assertClean();
});

test("deep link renders a valid chapter", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/#put-pcele", { waitUntil: "networkidle" });
  await expectChapter(page, 0, "deep link");
  assertClean();
});
