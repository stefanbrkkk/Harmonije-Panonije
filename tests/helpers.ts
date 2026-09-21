import { expect, type Page } from "@playwright/test";

/** Collects runtime failures; call the returned assertion at test end. */
export function trackErrors(page: Page) {
  const problems: string[] = [];
  page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(`console: ${message.text()}`);
  });
  return () => expect(problems, "unexpected runtime errors").toEqual([]);
}

/** Progress mapping identical to the scenes: scrollY for sticky progress f. */
export async function scrollToStickyProgress(
  page: Page,
  selector: string,
  fraction: number,
) {
  await page.evaluate(
    ([sel, f]) => {
      const node = document.querySelector<HTMLElement>(sel);
      if (!node) throw new Error(`missing ${sel}`);
      const span = Math.max(1, node.offsetHeight - window.innerHeight);
      window.scrollTo({ top: node.offsetTop + f * span, behavior: "instant" });
    },
    [selector, fraction] as const,
  );
}

/** Local-rectangle containment: no reliance on page-level scrollWidth. */
export async function expectContained(page: Page, selector: string) {
  const result = await page.evaluate((sel) => {
    const node = document.querySelector<HTMLElement>(sel);
    if (!node) return { ok: false, reason: "missing" };
    const rect = node.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    return {
      ok: rect.left >= -1 && rect.right <= vw + 1,
      reason: `l=${Math.round(rect.left)} r=${Math.round(rect.right)} vw=${vw}`,
    };
  }, selector);
  expect(result.ok, `${selector} contained (${result.reason})`).toBe(true);
}
