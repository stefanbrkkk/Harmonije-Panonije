import { expect, test } from "@playwright/test";
import { trackErrors } from "./helpers";

test("add, repeat, quantities, remove, clear", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator("#proizvodi").scrollIntoViewIfNeeded();
  await page.locator(".product-card__add").first().click();
  await expect(page.locator(".cart-toast")).toHaveClass(/is-visible/);
  const name = await page.locator(".cart-toast strong").textContent();
  // Repeat after ~2.3s: timer restarts and the quantity updates.
  await page.waitForTimeout(2300);
  await page.locator(".product-card__add").first().click();
  await expect(page.locator(".cart-toast__copy span")).toContainText("2×");
  expect(await page.locator(".cart-toast strong").textContent()).toBe(name);
  // Toast pauses while hovered, dismisses after leaving + timeout.
  await page.locator(".cart-toast").hover();
  await page.waitForTimeout(4000);
  await expect(page.locator(".cart-toast")).toHaveClass(/is-visible/);
  await page.mouse.move(700, 100);
  await expect(page.locator(".cart-toast")).not.toHaveClass(/is-visible/, { timeout: 8000 });
  // Drawer quantities via every trigger.
  await page.locator(".product-card__add").nth(1).click();
  await page.locator(".cart-toast button").first().click();
  await expect(page.locator(".order-drawer")).toHaveClass(/is-open/);
  expect(await page.locator(".order-item").count()).toBe(2);
  await page.locator(".order-item__controls button").last().click();
  // Cart held A×2 + B×1; incrementing B totals 4.
  expect(await page.locator(".order-drawer__summary strong").textContent()).toBe("4");
  await page.locator(".order-item__controls button").first().click();
  await page.locator(".order-item__remove").first().click();
  expect(await page.locator(".order-item").count()).toBe(1);
  await page.locator(".order-clear").click();
  await expect(page.locator(".order-empty")).toBeVisible();
  assertClean();
});

test("drawer: backdrop, Escape, focus trap, inert background, focus restore", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  const trigger = page.locator(".order-button").first();
  await trigger.click();
  const drawer = page.locator(".order-drawer");
  await expect(drawer).toHaveClass(/is-open/);
  expect(await page.locator("main").getAttribute("inert")).not.toBeNull();
  // Trap: a full cycle forward and backward never leaves the dialog (the
  // draft textarea inside the closed <details> must not be a stop).
  await expect(page.locator(".order-drawer .icon-button")).toBeFocused();
  for (let i = 0; i < 24; i += 1) {
    await page.keyboard.press("Tab");
    const inside = await page.evaluate(() => !!document.activeElement?.closest(".order-drawer"));
    expect(inside, `forward Tab ${i + 1} stays in the dialog`).toBe(true);
  }
  for (let i = 0; i < 24; i += 1) {
    await page.keyboard.press("Shift+Tab");
    const inside = await page.evaluate(() => !!document.activeElement?.closest(".order-drawer"));
    expect(inside, `backward Tab ${i + 1} stays in the dialog`).toBe(true);
  }
  // Shift+Tab from the first control wraps to the last one (never sticks).
  await page.locator(".order-drawer .icon-button").focus();
  await page.keyboard.press("Shift+Tab");
  await expect(page.locator(".order-drawer .icon-button")).not.toBeFocused();
  await page.keyboard.press("Escape");
  await expect(drawer).not.toHaveClass(/is-open/);
  await expect(page.locator("[data-ov-inert]")).toHaveCount(0);
  await expect(trigger).toBeFocused();
  // Backdrop pointer dismissal.
  await trigger.click();
  await expect(drawer).toHaveClass(/is-open/);
  await page.locator(".drawer-backdrop").click({ force: true });
  await expect(drawer).not.toHaveClass(/is-open/);
  assertClean();
});

test("removing the focused control keeps focus inside the dialog", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator(".product-card__add").first().click();
  await page.locator(".order-button").first().click();
  await page.locator(".order-clear").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".order-empty")).toBeVisible();
  await expect(page.locator(".order-drawer .icon-button"), "focus rescued to the close button").toBeFocused();
  assertClean();
});

test("empty drawer CTA routes to the catalog with focus", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator(".order-button").first().click();
  await expect(page.locator(".order-drawer")).toHaveClass(/is-open/);
  await page.locator(".order-empty .button").click();
  await expect(page.locator(".order-drawer")).not.toHaveClass(/is-open/);
  await expect(page).toHaveURL(/#proizvodi/);
  await expect(page.locator("#proizvodi-heading")).toBeFocused();
  assertClean();
});

test("inquiry draft: fields, mailto inspection, clipboard stubs", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator("#proizvodi").scrollIntoViewIfNeeded();
  await page.locator(".product-card__add").first().click();
  await page.locator(".order-button").first().click();
  await expect(page.locator(".order-drawer")).toHaveClass(/is-open/);
  await page.locator('.order-contact-form input[autocomplete="name"]').fill("Test Ime");
  await page.locator('.order-contact-form input[autocomplete="tel"]').fill("060123456");
  await page.locator(".order-contact-form__full textarea").first().fill("Napomena");
  const mailto = await page.locator('.order-drawer__foot a.button').getAttribute("href");
  expect(mailto?.startsWith("mailto:")).toBe(true);
  expect(decodeURIComponent(mailto ?? "")).toContain("Test Ime");
  expect(decodeURIComponent(mailto ?? "")).toContain("060123456");
  expect(mailto, "RFC 6068 line breaks").toContain("%0D%0A");
  await expect(page.locator(".order-drawer__notice")).toBeEmpty();
  // Clipboard success stub (simulated: never sends anything).
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: async () => undefined },
      configurable: true,
    });
  });
  await page.locator(".order-drawer__alternatives button.text-link").click();
  await expect(page.locator(".order-drawer__alternatives button.text-link")).toContainText(/kopiran/i);
  // Overlapping copies: the second success restarts the reset window.
  await page.locator('.order-contact-form input[autocomplete="name"]').fill("Test Ime 3");
  await page.locator(".order-drawer__alternatives button.text-link").click();
  await expect(page.locator(".order-drawer__alternatives button.text-link")).toContainText(/kopiran/i);
  await page.waitForTimeout(1200);
  await page.locator('.order-contact-form input[autocomplete="name"]').fill("Test Ime 4");
  await page.locator(".order-drawer__alternatives button.text-link").click();
  await expect(page.locator(".order-drawer__alternatives button.text-link")).toContainText(/kopiran/i);
  // Past the first timer's original deadline, the newer feedback survives.
  await page.waitForTimeout(1000);
  await expect(page.locator(".order-drawer__alternatives button.text-link")).toContainText(/kopiran/i);
  // Clipboard rejection stub.
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async () => {
          throw new Error("denied");
        },
      },
      configurable: true,
    });
  });
  // A rejected Clipboard API (in-app browsers, denied permission) falls
  // back to the legacy copy command, which carries the whole draft.
  await page.evaluate(() => {
    const w = window as unknown as { copied?: string };
    document.execCommand = ((command: string) => {
      if (command !== "copy") return false;
      const field = document.activeElement as HTMLTextAreaElement | null;
      w.copied = field?.value.slice(field.selectionStart, field.selectionEnd);
      return true;
    }) as typeof document.execCommand;
  });
  await page.locator('.order-contact-form input[autocomplete="name"]').fill("Test Ime 2");
  await page.locator(".order-drawer__alternatives button.text-link").click();
  await expect(page.locator(".order-drawer__alternatives button.text-link")).toContainText(/kopiran/i);
  expect(await page.evaluate(() => (window as unknown as { copied?: string }).copied)).toContain("Test Ime 2");
  await expect(page.locator(".order-drawer__alternatives button.text-link"), "focus returns after the legacy copy").toBeFocused();
  // Both paths failing reports the failure.
  await page.evaluate(() => {
    document.execCommand = (() => false) as typeof document.execCommand;
  });
  await page.locator('.order-contact-form input[autocomplete="name"]').fill("Test Ime 5");
  await page.locator(".order-drawer__alternatives button.text-link").click();
  await expect(page.locator(".order-drawer__alternatives button.text-link")).toContainText(/nije uspelo/i);
  // Selectable fallback carries the draft.
  const draft = await page.locator(".order-draft textarea").inputValue();
  expect(draft).toMatch(/^Dobar dan/);
  assertClean();
});

test("an over-long inquiry opens a bare mail and asks to paste the copied text", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator("#proizvodi").scrollIntoViewIfNeeded();
  for (const tab of ["#tab-sirupi", "#tab-djumbir", "#tab-busteri"]) {
    await page.locator(tab).click();
    if (await page.locator(".catalog-more button").count()) await page.locator(".catalog-more button").click();
    const adds = page.locator(".product-card__add");
    for (let i = 0; i < (await adds.count()); i += 1) await adds.nth(i).click();
  }
  await page.locator(".order-button").first().click();
  // Diacritics triple in percent-encoding: a realistic Serbian draft with
  // the whole range selected clearly exceeds the mail-handler limit.
  await page.locator('.order-contact-form input[autocomplete="name"]').fill("Đurđica Šćepanović-Živković");
  await page.locator(".order-contact-form__full textarea").first().fill("Pitanje o ukusu, čuvanju, dostavi i preuzimanju — Budisava ili Novi Sad? ".repeat(6));
  const mailto = (await page.locator(".order-drawer__foot a.button").getAttribute("href")) ?? "";
  expect(mailto.length, "stays under the mail-handler limit").toBeLessThanOrEqual(1900);
  expect(mailto).not.toContain("body=");
  await expect(page.locator(".order-drawer__notice")).toHaveText(/predugačak/);
  assertClean();
});

test("the quantity cap disables + and adds nothing more", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator("#proizvodi").scrollIntoViewIfNeeded();
  await page.locator(".product-card__add").first().click();
  await page.locator(".order-button").first().click();
  const plus = page.locator(".order-item__controls button").last();
  for (let i = 1; i < 99; i += 1) await plus.click();
  await expect(page.locator(".order-drawer__summary strong")).toHaveText("99");
  await expect(plus).toBeDisabled();
  // Still focusable at the cap: keyboard users keep their place.
  await plus.focus();
  await page.keyboard.press("Enter");
  await expect(plus).toBeFocused();
  await expect(page.locator(".order-drawer__summary strong")).toHaveText("99");
  assertClean();
});

test("mobile bottom bar opens the inquiry", async ({ page }) => {
  const assertClean = trackErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator(".mobile-order-bar").click();
  await expect(page.locator(".order-drawer")).toHaveClass(/is-open/);
  assertClean();
});
