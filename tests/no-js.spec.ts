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
  await expect(page.locator(".bee-journey__intro")).toBeVisible();
  await expect(page.locator(".bee-journey__outro")).toBeVisible();
  await expect(page.locator("#proizvodi .product-card").first()).toBeVisible();
  await expect(page.locator("#kontakt")).toContainText(/063 727 4392/);
  expect(await page.locator("h2").count()).toBeGreaterThan(3);
  await context.close();
});
