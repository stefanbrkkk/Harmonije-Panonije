import { expect, test } from "@playwright/test";

test.use({ javaScriptEnabled: false });

test("meaningful content is visible without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".hero-copy h1")).toBeVisible();
  for (const suffix of ["a", "b", "c"]) {
    await expect(page.locator(`.honey-harvest__chapter--${suffix}`)).toBeVisible();
  }
  // The three honey chapters stack as readable blocks instead of sharing
  // one absolutely positioned box in the pinned frame.
  const honeyBoxes = await page.locator(".honey-harvest__chapter").evaluateAll((nodes) =>
    nodes.map((node) => {
      const rect = node.getBoundingClientRect();
      return { top: rect.top, bottom: rect.bottom };
    }),
  );
  for (let i = 1; i < honeyBoxes.length; i += 1) {
    expect(honeyBoxes[i].top, `honey chapter ${i + 1} starts below chapter ${i}`).toBeGreaterThanOrEqual(honeyBoxes[i - 1].bottom - 1);
  }
  // Journey without JavaScript: one static, complete frame — the final plate
  // plus the full four-step index (opacity, not just box visibility).
  const journey = await page.evaluate(() => {
    const section = document.querySelector<HTMLElement>("#put-pcele")!;
    const opacity = (el: Element) => parseFloat(getComputedStyle(el).opacity);
    const chapters = [...section.querySelectorAll("[data-chapter]")];
    const plates = [...section.querySelectorAll("[data-plate]")];
    return {
      shown: chapters.filter((el) => opacity(el) > 0.98).map((el) => el.querySelector("h3")!.textContent),
      plates: plates.map(opacity),
      index: [...section.querySelectorAll(".journey__index strong")].map((el) => el.textContent),
      sticky: getComputedStyle(section.querySelector(".journey__sticky")!).position,
    };
  });
  expect(journey.shown, "final chapter composed").toEqual(["Panonija"]);
  expect(journey.plates, "final plate only").toEqual([0, 0, 0, 1]);
  expect(journey.index).toEqual(["Priroda", "Sastojci", "Craft", "Panonija"]);
  expect(journey.sticky, "no pinned scroll without JavaScript").not.toBe("sticky");
  await expect(page.locator(".journey__index")).toBeVisible();
  await expect(page.locator(".ingredients-base")).toHaveCount(2);
  await expect(page.locator(".ingredients-index li")).toHaveCount(5);
  await expect(page.locator("#proizvodi .product-card").first()).toBeVisible();
  await expect(page.locator("#kontakt")).toContainText(/063 727 4392/);
  // Tabs and "show all" need the script: the whole range is listed instead,
  // and controls that would do nothing are not shown.
  await expect(page.locator(".catalog-noscript li")).toHaveCount(13);
  await expect(page.locator(".catalog-noscript")).toContainText(/Kurkuma\s·\sđumbir/);
  for (const selector of [".catalog-toolbar", ".catalog-more", ".mobile-order-bar", ".order-button", ".product-card__add"]) {
    await expect(page.locator(selector).first(), `${selector} hidden without JavaScript`).toBeHidden();
  }
  expect(await page.locator("h2").count()).toBeGreaterThan(3);
  await context.close();
});
