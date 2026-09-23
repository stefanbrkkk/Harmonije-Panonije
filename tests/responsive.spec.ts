import { expect, test } from "@playwright/test";
import { expectContained, trackErrors } from "./helpers";

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
  { width: 844, height: 430 },
  { width: 768, height: 390 },
];

for (const viewport of viewports) {
  test(`no page overflow at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    const assertClean = trackErrors(page);
    await page.setViewportSize(viewport);
    await page.goto("/", { waitUntil: "networkidle" });
    const overflow = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    expect(overflow.scroll, "page-level overflow").toBeLessThanOrEqual(overflow.client + 1);
    assertClean();
  });
}

test("hero content fits its shell at narrow phones", async ({ page }) => {
  const assertClean = trackErrors(page);
  for (const width of [430, 390, 360, 320]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/", { waitUntil: "networkidle" });
    for (const selector of [".hero-copy", ".hero-copy h1", ".hero-copy__lead", ".hero-copy__actions"]) {
      await expectContained(page, selector);
    }
    for (const cta of await page.locator(".hero-copy__actions a").all()) {
      const box = await cta.boundingBox();
      expect(box, "CTA inside viewport").not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(-1);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1);
    }
  }
  assertClean();
});

test("hero survives 150% and 200% text enlargement", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/", { waitUntil: "networkidle" });
  for (const percent of [150, 200]) {
    await page.evaluate((k) => {
      document.documentElement.style.fontSize = `${(16 * k) / 100}px`;
    }, percent);
    // Settle reflow after the root font-size change before measuring.
    await page.waitForTimeout(400);
    for (const selector of [".hero-copy", ".hero-copy h1", ".hero-copy__lead", ".hero-copy__actions"]) {
      await expectContained(page, selector);
    }
  }
  assertClean();
});

test("catalog, header bar and drawer fit small viewports", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator("#proizvodi").scrollIntoViewIfNeeded();
  const cards = page.locator(".product-card");
  expect(await cards.count()).toBeGreaterThan(0);
  for (const card of await cards.all()) {
    const box = await card.boundingBox();
    expect(box!.width).toBeLessThanOrEqual(360 + 1);
  }
  assertClean();
});

test("ingredient specimens do not overlap at 1024px", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.evaluate(() => {
    const node = document.querySelector<HTMLElement>("#sastojci")!;
    window.scrollTo({ top: node.offsetTop + 100, behavior: "instant" });
  });
  await page.waitForTimeout(1000);
  const overlaps: Array<[string, string]> = await page.evaluate(() => {
    const cards = [...document.querySelectorAll<HTMLElement>(".specimen")].map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        name: element.querySelector("h3")?.textContent ?? "?",
        box: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom },
      };
    });
    const hits: Array<[string, string]> = [];
    for (let i = 0; i < cards.length; i += 1) {
      for (let j = i + 1; j < cards.length; j += 1) {
        const a = cards[i].box;
        const b = cards[j].box;
        if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) {
          hits.push([cards[i].name, cards[j].name]);
        }
      }
    }
    return hits;
  });
  expect(overlaps, "tablet ingredient layout without collisions").toEqual([]);
  assertClean();
});

test("atlas hierarchy: primaries dominate, seal anchors, order reads", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });
  const atlas = await page.evaluate(() => {
    const iconArea = (article: Element) => {
      const rect = article.querySelector(".specimen__icon")!.getBoundingClientRect();
      return rect.width * rect.height;
    };
    const primaries = [...document.querySelectorAll(".specimen--primary")];
    const supporting = [...document.querySelectorAll(".specimen--support")];
    const order = [...document.querySelectorAll(".ingredients-atlas .specimen h3")].map((h) => h.textContent);
    const seal = document.querySelector(".seal");
    const sealRect = seal!.getBoundingClientRect();
    const firstPrimary = primaries[0]!.getBoundingClientRect();
    return {
      primaryArea: primaries.map(iconArea),
      supportArea: supporting.map(iconArea),
      order,
      sealBelowPrimaries: sealRect.top >= firstPrimary.bottom - 2,
      sealText: seal!.textContent,
    };
  });
  expect(atlas.primaryArea.length, "two primary specimens").toBe(2);
  for (const area of atlas.primaryArea) {
    for (const small of atlas.supportArea) {
      expect(area, "primary icons dominate supporting icons").toBeGreaterThan(small * 1.8);
    }
  }
  expect(atlas.order, "coherent reading order").toEqual([
    "01Livadski med",
    "02Ceđeni limun",
    "03Đumbir",
    "04Bobičasto voće",
    "05Voće",
    "06Lekovito bilje",
    "07Povrće",
  ]);
  expect(atlas.sealBelowPrimaries, "seal anchors below primaries").toBe(true);
  expect(atlas.sealText, "seal keeps brand mark").toContain("sklad sastojaka");
  assertClean();
});

test("phone atlas stays readable without overflow", async ({ page }) => {
  const assertClean = trackErrors(page);
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.evaluate(() => {
      document.querySelector<HTMLElement>("#sastojci")!.scrollIntoView({ block: "start", behavior: "instant" });
    });
    await page.waitForTimeout(600);
    const state = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const bad = [...document.querySelectorAll<HTMLElement>(".ingredients-atlas .specimen")].filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.left < -1 || rect.right > vw + 1;
      }).length;
      return {
        bad,
        count: document.querySelectorAll(".ingredients-atlas .specimen").length,
        sealVisible: (document.querySelector(".seal")?.getBoundingClientRect().height ?? 0) > 40,
      };
    });
    expect(state.count, "seven specimens").toBe(7);
    expect(state.bad, `no overflowing specimens at ${width}px`).toBe(0);
    expect(state.sealVisible, "seal present on phone").toBe(true);
  }
  assertClean();
});
