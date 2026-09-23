import { expect, test } from "@playwright/test";
import { trackErrors } from "./helpers";

test.use({ reducedMotion: "reduce" });

test("reduced motion shows all meaningful content statically", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  expect(await page.locator(".page-bee").evaluate((node) => getComputedStyle(node).display)).toBe("none");
  for (const suffix of ["a", "b", "c"]) {
    const chapter = page.locator(`.honey-harvest__chapter--${suffix}`);
    await expect(chapter).toBeVisible();
    expect((await chapter.boundingBox())!.height).toBeGreaterThan(60);
  }
  const journey = await page.evaluate(() => {
    const section = document.querySelector<HTMLElement>("#put-pcele")!;
    const opacity = (el: Element) => parseFloat(getComputedStyle(el).opacity);
    return {
      live: section.classList.contains("is-live"),
      shown: [...section.querySelectorAll("[data-chapter]")].filter((el) => opacity(el) > 0.98).map((el) => el.querySelector("h3")!.textContent),
      plates: [...section.querySelectorAll("[data-plate]")].map(opacity),
      height: section.offsetHeight,
      sticky: getComputedStyle(section.querySelector(".journey__sticky")!).position,
    };
  });
  expect(journey.live, "no scroll-driven journey under reduced motion").toBe(false);
  expect(journey.shown, "one complete static journey frame").toEqual(["Panonija"]);
  expect(journey.plates).toEqual([0, 0, 0, 1]);
  expect(journey.sticky).not.toBe("sticky");
  expect(journey.height, "no pinned scroll distance").toBeLessThanOrEqual(page.viewportSize()!.height + 2);
  await expect(page.locator(".journey__index")).toBeVisible();
  for (const heading of await page.locator(".section-heading h2").all()) {
    await expect(heading).toBeVisible();
  }
  assertClean();
});

test("reduced motion performs no perpetual scheduler work", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.addInitScript(() => {
    (window as unknown as { __rafCount: number }).__rafCount = 0;
    const original = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (callback: FrameRequestCallback) => {
      (window as unknown as { __rafCount: number }).__rafCount += 1;
      return original(callback);
    };
  });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo({ top: 3000, behavior: "instant" }));
  await page.waitForTimeout(1200);
  const first = await page.evaluate(() => (window as unknown as { __rafCount: number }).__rafCount);
  await page.waitForTimeout(2000);
  const second = await page.evaluate(() => (window as unknown as { __rafCount: number }).__rafCount);
  expect(second - first, "idle rAF churn under reduced motion").toBeLessThanOrEqual(4);
  assertClean();
});

test("reduced motion disables perpetual decorative animation", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  const animated = await page.evaluate(() => {
    const names = (selector: string) => {
      const node = document.querySelector(selector);
      if (!node) return [];
      return getComputedStyle(node)
        .animationName.split(",")
        .map((name) => name.trim())
        .filter((name) => name && name !== "none");
    };
    return {
      wings: names(".journey-bee__wings"),
      bob: names(".journey-bee__bob"),
      route: names(".delivery-map__route"),
      heroFloat: names(".hero-art__ingredient--lemon"),
      halo: names(".hero-art__halo"),
    };
  });
  expect(animated.wings, "no perpetual wing flap").toEqual([]);
  expect(animated.bob, "no perpetual journey bee bob").toEqual([]);
  expect(animated.route, "no perpetual route drift").toEqual([]);
  expect(animated.heroFloat, "no perpetual hero float").toEqual([]);
  expect(animated.halo, "no perpetual halo pulse").toEqual([]);
  assertClean();
});
