import { expect, test } from "@playwright/test";
import { trackErrors } from "./helpers";

/*
 * Ingredients: honey and lemon are the illustrated, captioned foundation;
 * the five flavour layers form a subordinate typographic index. The spread
 * must read as one complete composition and never collide or overflow.
 */

const layers = ["Đumbir i začini", "Bobičasto voće", "Voće", "Lekovito bilje", "Povrće"];

test("hierarchy: two illustrated foundations dominate a five-item index", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/#sastojci", { waitUntil: "networkidle" });
  const state = await page.evaluate(() => {
    const section = document.querySelector("#sastojci")!;
    const size = (el: Element) => parseFloat(getComputedStyle(el).fontSize);
    const base = [...section.querySelectorAll(".ingredients-base h3")];
    const index = [...section.querySelectorAll(".ingredients-index li")];
    const plate = section.querySelector(".ingredients-plate")!.getBoundingClientRect();
    const indexBox = section.querySelector(".ingredients-index")!.getBoundingClientRect();
    const headings = [...section.querySelectorAll("h2, h3")].map((h) => h.textContent);
    return {
      base: base.map((h) => h.textContent),
      baseSize: Math.min(...base.map(size)),
      index: index.map((li) => li.querySelector("h3")!.textContent),
      latin: index.map((li) => li.querySelector('[lang="la"]')?.textContent ?? ""),
      indexSize: Math.max(...index.map((li) => size(li.querySelector("h3")!))),
      plateArea: plate.width * plate.height,
      indexArea: indexBox.width * indexBox.height,
      headings,
    };
  });
  expect(state.base, "foundations captioned on the plate").toEqual(["Livadski med", "Ceđeni limun"]);
  expect(state.index, "flavour layers in reading order").toEqual(layers);
  expect(state.latin.every((text) => text.length > 2), "each layer carries its botanical name").toBe(true);
  expect(state.baseSize, "foundation names outrank index names").toBeGreaterThan(state.indexSize * 1.5);
  expect(state.plateArea, "the plate is the dominant element").toBeGreaterThan(state.indexArea * 1.4);
  expect(state.headings[0], "section heading reads first").toBe("Šta ulazi u harmoniju?");
  assertClean();
});

test("the whole spread fits one viewport on desktop and laptop", async ({ page }) => {
  const assertClean = trackErrors(page);
  for (const viewport of [{ width: 1440, height: 900 }, { width: 1280, height: 800 }, { width: 1024, height: 768 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/#sastojci", { waitUntil: "networkidle" });
    await page.waitForTimeout(900);
    const fit = await page.evaluate(() => {
      const section = document.querySelector("#sastojci")!;
      const header = document.querySelector(".site-header")!.getBoundingClientRect().bottom;
      const parts = [".ingredients-head", ".ingredients-plate", ".ingredients-index"].map((selector) =>
        section.querySelector(selector)!.getBoundingClientRect(),
      );
      return {
        top: Math.min(...parts.map((r) => r.top)),
        bottom: Math.max(...parts.map((r) => r.bottom)),
        header,
        viewport: window.innerHeight,
      };
    });
    expect(fit.top, `${viewport.width}x${viewport.height} starts below header`).toBeGreaterThanOrEqual(fit.header);
    expect(fit.bottom, `${viewport.width}x${viewport.height} ends above the fold`).toBeLessThanOrEqual(fit.viewport);
  }
  assertClean();
});

test("no collisions or overflow at any viewport, incl. 150% and 200% text", async ({ page }) => {
  test.setTimeout(180_000);
  const assertClean = trackErrors(page);
  const viewports = [
    [1440, 900], [1280, 800], [1024, 768], [768, 1024], [430, 932], [390, 844], [360, 800], [320, 568], [844, 390],
  ];
  for (const [width, height] of viewports) {
    await page.setViewportSize({ width, height });
    await page.goto("/", { waitUntil: "networkidle" });
    for (const scale of ["100%", "150%", "200%"]) {
      if (scale !== "100%" && width > 900) continue;
      await page.evaluate((value) => {
        document.documentElement.style.fontSize = value;
        document.querySelector("#sastojci")!.scrollIntoView({ block: "start", behavior: "instant" });
      }, scale);
      // Let entrance reveals (a short translate) finish before measuring.
      await expect
        .poll(() =>
          page.evaluate(
            () =>
              document
                .getAnimations()
                .filter((animation) => (animation.effect as KeyframeEffect | null)?.target?.closest?.("#sastojci")).length,
          ),
        )
        .toBe(0);
      const problems = await page.evaluate(() => {
        const section = document.querySelector("#sastojci")!;
        const vw = document.documentElement.clientWidth;
        const found: string[] = [];
        const boxes = [
          ...section.querySelectorAll<HTMLElement>(".ingredients-head, .ingredients-base, .ingredients-plate__kicker, .ingredients-index li"),
        ].map((el) => ({ el, r: el.getBoundingClientRect() }));
        const name = (el: HTMLElement) => el.querySelector("h2, h3")?.textContent ?? el.className.split(" ")[0];
        for (let i = 0; i < boxes.length; i += 1) {
          const { el, r } = boxes[i];
          if (r.left < -1 || r.right > vw + 1) found.push(`off-screen: ${name(el)}`);
          for (let j = i + 1; j < boxes.length; j += 1) {
            const o = boxes[j].r;
            if (r.left < o.right - 1 && o.left < r.right - 1 && r.top < o.bottom - 1 && o.top < r.bottom - 1) {
              found.push(`overlap: ${name(el)} × ${name(boxes[j].el)}`);
            }
          }
        }
        // Caption text must stay inside the plate's caption band.
        const plate = section.querySelector(".ingredients-plate")!.getBoundingClientRect();
        section.querySelectorAll(".ingredients-base").forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.right > plate.right + 1 || r.bottom > plate.bottom + 1) found.push("caption leaves the plate");
        });
        section.querySelectorAll<HTMLElement>("h2, h3, p, span").forEach((el) => {
          if (el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflow !== "visible") found.push(`clipped: ${el.textContent}`);
        });
        return found;
      });
      // Page-level scroll overflow at default text size (larger text sizes are
      // covered by the per-element containment above).
      if (scale === "100%") {
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), `${width}x${height} no page overflow`).toBe(true);
      }
      expect(problems, `${width}x${height} at ${scale}`).toEqual([]);
    }
    await page.evaluate(() => document.documentElement.style.removeProperty("font-size"));
  }
  assertClean();
});
