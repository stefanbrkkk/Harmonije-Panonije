import { expect, test } from "@playwright/test";
import { trackErrors } from "./helpers";

/*
 * Dostava: an engraved atlas plate of southern Bačka with the family farm in
 * Budisava as the origin (client email, 26 Sep 2026). The plate must render
 * its relief, carry real (crisp, readable) labels that stay inside the
 * frame at every width, and settle into a complete static state.
 */

const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
  { width: 320, height: 568 },
  { width: 844, height: 390 },
];

test("the plate names Budisava as home and Novi Sad as where it began", async ({ page }) => {
  const assertClean = trackErrors(page);
  const relief = page.waitForResponse((response) => response.url().endsWith("/atlas/juzna-backa-podloga.svg"));
  await page.goto("/#dostava", { waitUntil: "networkidle" });
  expect((await relief).status(), "relief image served").toBe(200);
  await expect(page.locator("#dostava h2")).toHaveText(/Iz Budisave do.vaše trpeze\./);
  await expect(page.locator("#dostava")).not.toContainText("Novi Sad je polazna tačka");
  const map = page.locator("#dostava svg.atlas");
  await expect(map).toHaveAttribute("role", "img");
  await expect(page.locator("#atlasTitle")).toContainText("Budisavi");
  const labels = await map.locator("text").allTextContents();
  for (const label of ["Budisava", "PORODIČNO GAZDINSTVO", "NOVI SAD", "po dogovoru", "Dunav", "FRUŠKA GORA"]) {
    expect(labels, `map label ${label}`).toContain(label);
  }
  const legend = await page.locator(".atlas-plate__legend li b").allTextContents();
  expect(legend).toEqual(["Budisava", "Novi Sad", "Dostava i preuzimanje"]);
  assertClean();
});

for (const viewport of VIEWPORTS) {
  test(`labels stay readable and inside the frame at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    const assertClean = trackErrors(page);
    await page.setViewportSize(viewport);
    await page.goto("/#dostava", { waitUntil: "networkidle" });
    await page.locator(".delivery-map").scrollIntoViewIfNeeded();
    const report = await page.evaluate(() => {
      const frame = document.querySelector(".atlas-plate__frame")!.getBoundingClientRect();
      const problems: string[] = [];
      const important = ["at-l--origin", "at-l--tag", "at-l--city", "at-l--route", "at-l--village"];
      for (const node of document.querySelectorAll<SVGTextElement>("svg.atlas text")) {
        // Hidden by the crop tiers (itself or an ancestor group): no box.
        if (node.getClientRects().length === 0) continue;
        const rect = node.getBoundingClientRect();
        const name = node.textContent ?? "";
        if (rect.left < frame.left - 1 || rect.right > frame.right + 1 || rect.top < frame.top - 1 || rect.bottom > frame.bottom + 1) {
          problems.push(`clipped: ${name}`);
        }
        if ([...node.classList].some((c) => important.includes(c)) && rect.height < 8) problems.push(`too small: ${name} ${rect.height.toFixed(1)}px`);
      }
      const doc = document.documentElement;
      return { problems, overflow: doc.scrollWidth - doc.clientWidth };
    });
    expect(report.problems).toEqual([]);
    expect(report.overflow, "no horizontal page overflow").toBeLessThanOrEqual(1);
    assertClean();
  });
}

test("the route draws once and the plate settles complete", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.querySelector("#dostava")!.scrollIntoView({ block: "start", behavior: "instant" }));
  // The whole settled state in one poll: the route label fades in ~300ms
  // after the route finishes, so checking it at that exact moment raced.
  const read = () =>
    page.evaluate(() => ({
      route: parseFloat(getComputedStyle(document.querySelector(".at-route-mask")!).strokeDashoffset),
      bee: parseFloat(getComputedStyle(document.querySelector(".at-bee__flight")!).opacity),
      label: parseFloat(getComputedStyle(document.querySelector(".at-l--route")!).opacity),
    }));
  await expect
    .poll(async () => {
      const state = await read();
      return state.route < 0.01 && state.bee > 0.99 && state.label > 0.99;
    }, { message: "route drawn, bee and route label settled", timeout: 8000 })
    .toBe(true);
  // Nothing on the plate animates forever.
  const infinite = await page.evaluate(() =>
    document
      .getAnimations()
      .filter((a) => (a.effect as KeyframeEffect | null)?.target?.closest?.(".delivery-map") && a.effect?.getTiming().iterations === Infinity).length,
  );
  expect(infinite).toBe(0);
  assertClean();
});
