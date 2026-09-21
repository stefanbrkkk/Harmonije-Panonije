import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const required = [
  "app/page.tsx",
  "app/layout.tsx",
  "app/globals.css",
  "app/robots.ts",
  "app/sitemap.ts",
  "src/data/siteContent.ts",
  "src/components/PageBee.tsx",
  "src/components/HoneyHarvestSection.tsx",
  "src/components/ProductCatalog.tsx",
  "src/components/OrderDrawer.tsx",
  "CLIENT-CONFIRMATION.md",
];

const errors = [];
for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) errors.push(`Missing required file: ${file}`);
}

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const target = path.join(dir, entry.name);
  if (entry.name === "node_modules" || entry.name === ".next" || entry.name === ".git") return [];
  return entry.isDirectory() ? walk(target) : [target];
});

const sourceFiles = walk(root).filter((file) => /\.(ts|tsx|css|md)$/.test(file));
const source = sourceFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n");

const forbidden = [
  ["TODO", "TODO marker"],
  ["Lorem ipsum", "Lorem ipsum placeholder"],
  ["console.log", "console.log statement"],
  ["0% sugar", "unsupported sugar-free claim"],
  ["Besplatna dostava širom Srbije", "unsupported nationwide delivery claim"],
  ["organski sertifikovani proizvodi", "unsupported organic-certification claim"],
];
for (const [needle, label] of forbidden) {
  if (source.toLocaleLowerCase("sr").includes(needle.toLocaleLowerCase("sr"))) errors.push(`Found ${label}: ${needle}`);
}

const navSource = fs.readFileSync(path.join(root, "src/data/siteContent.ts"), "utf8");
const pageSource = sourceFiles.filter((file) => file.endsWith(".tsx")).map((file) => fs.readFileSync(file, "utf8")).join("\n");
const hrefTargets = [...navSource.matchAll(/href:\s*["']#([^"']+)["']/g)].map((match) => match[1]);
const ids = new Set([...pageSource.matchAll(/id=["']([^"']+)["']/g)].map((match) => match[1]));
for (const target of hrefTargets) {
  if (!ids.has(target)) errors.push(`Navigation target #${target} has no matching static id.`);
}

const productMatches = navSource.match(/legacy\(\{/g)?.length ?? 0;
if (productMatches < 30) errors.push(`Expected at least 30 legacy catalog entries; found ${productMatches}.`);
if (!navSource.includes("showLegacyPublicPricing: false")) errors.push("Legacy public pricing must remain disabled by default.");

// Structural regression tripwires (HP-46). Each guards a confirmed, fixed
// production defect; behavioral coverage lives in the Playwright cycle
// suites. Keep these property-focused: they must fail only when the fixed
// behavior actually regresses.
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const css = read("app/globals.css");
const header = read("src/components/Header.tsx");
const catalog = read("src/components/ProductCatalog.tsx");
const visuals = read("src/components/ProductVisual.tsx");
const drawer = read("src/components/OrderDrawer.tsx");
const hero = read("src/components/Hero.tsx");
const journey = read("src/components/BeeJourney.tsx");
const honey = read("src/components/HoneyHarvestSection.tsx");
const bee = read("src/components/PageBee.tsx");
const cart = read("src/components/CartProvider.tsx");
const toast = read("src/components/CartToast.tsx");
const scene = read("src/lib/scene.ts");

const tripwires = [
  // HP-01/02/25: menu must be a header sibling (stacking context), not a child.
  ["menu/header sibling", header.indexOf('id="mobile-menu"') > header.indexOf("</header>")],
  ["menu trap covers toggle", header.includes("[toggle, ...panel]")],
  ["desktop breakpoint reconcile", header.includes("min-width: 1081px")],
  // HP-06/29: no remount-based grid transition on expansion.
  ["no expand remount key", !catalog.includes("transitionKey")],
  ["panel scroll-anchor opt-out", css.includes(".catalog-panel { overflow-anchor: none; }")],
  // HP-22: shared query normalization drives filter and UI state.
  ["query normalization", catalog.includes("normalizeQuery(") && catalog.includes("const searching")],
  ["accessible result count", catalog.includes('role="status"')],
  // HP-45: typed publication gate; the global flag alone publishes nothing.
  ["price publication gate", catalog.includes("publishedPrice(") && !catalog.includes("showLegacyPublicPricing &&")],
  // HP-23: decorative identity keyed by product id.
  ["id-stable artwork", visuals.includes("id: string") && visuals.includes("identityFor")],
  // HP-18: real newlines in bottle labels, never literal backslash-n props.
  ["hero label newlines", !/label="[^"]*\\n/.test(hero)],
  // HP-08/20: reduced motion keeps all chapters; base state reads without JS.
  ["reduced chapters kept", !css.includes("chapter--c { display: none")],
  ["is-live chapter gating", css.includes(".honey-harvest.is-live .honey-harvest__chapter")],
  ["is-live outro gating", css.includes(".bee-journey.is-live .bee-journey__outro")],
  // HP-08: static bee poses for no-JS first paint.
  ["journey bee fallback pose", journey.includes('transform="translate(75 375)"')],
  ["honey bee fallback pose", honey.includes('transform="translate(150 150)')],
  // HP-14/33: notice events carry sequence + quantity; quantities bounded.
  ["notice event model", cart.includes("seq") && cart.includes("MAX_QUANTITY")],
  ["toast hover/focus pause", toast.includes("pausedRef")],
  // HP-15: drawer never restores focus into hidden content.
  ["visible focus restore", drawer.includes("restoreFocus(")],
  // HP-27: empty-drawer CTA navigates with a focus target.
  ["drawer CTA target", drawer.includes('href="#proizvodi"') && catalog.includes('id="proizvodi-heading"')],
  // HP-14: selectable draft fallback + bounded inputs.
  ["draft fallback", drawer.includes("order-draft")],
  ["input bounds", drawer.includes("maxLength={500}")],
  // HP-11: compact thumbnails use explicit geometry, not scaled full art.
  ["compact geometry", css.includes(".product-visual--compact .product-bottle {") && !css.includes("scale(.31)")],
  // HP-12: desktop 6n feature-row reset at tablet.
  ["tablet 6n reset", css.includes(".product-card:nth-child(6n) { grid-template-columns: none;")],
  // HP-03/05/09: camera-framed responsive scenes.
  ["scene camera", journey.includes("cameraShift(") && honey.includes("cameraShift(")],
  // HP-04: complementary chapter weights.
  ["chapter handoff windows", honey.includes("fade(copyARef.current, -0.05, 0.0, 0.33, 0.38)")],
  // HP-16/36/37/40: one controlled scheduler for the three scenes.
  ["shared scene loop", journey.includes("createSceneLoop(") && honey.includes("createSceneLoop(") && bee.includes("createSceneLoop(")],
  // HP-07: AA contrast tokens.
  ["contrast tokens", css.includes("--muted: #585e59") && css.includes("--honey-dark: #7a4f0e")],
  // HP-28: labelled generic containers carry roles.
  ["labelled div roles", ![...source.matchAll(/<div[^>]*aria-label[^>]*>/g)].some((m) => !/role=/.test(m[0]))],
  // axe follow-ups: dialog on div, unlabelled brand mark.
  ["dialog semantics", !/<aside[^>]*role="dialog"/.test(drawer) && drawer.includes('role="dialog"')],
  ["brand mark naming", !read("src/components/BrandMark.tsx").includes("aria-label")],
  // HP-30/42 + HP-41: button reset + anchor clearance.
  ["text-link reset", css.includes("background: transparent;") && css.includes("section[id] { scroll-margin-top: 72px; }")],
];
for (const [label, ok] of tripwires) {
  if (!ok) errors.push(`Regression tripwire failed: ${label}.`);
}

if (errors.length) {
  console.error("Verification failed:\n" + errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(`Verification passed: ${sourceFiles.length} source/docs files checked, ${productMatches} catalog entries found.`);
