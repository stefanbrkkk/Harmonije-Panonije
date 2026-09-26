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
  ["sugar free", "unsupported sugar-free claim"],
  ["sugar-free", "unsupported sugar-free claim"],
  ["bez dodatog šećera", "unconfirmed nutrition claim (CLIENT-CONFIRMATION.md)"],
  ["bez dodatog secera", "unconfirmed nutrition claim (CLIENT-CONFIRMATION.md)"],
  ["bez šećera", "unconfirmed nutrition claim (CLIENT-CONFIRMATION.md)"],
  ["bez secera", "unconfirmed nutrition claim (CLIENT-CONFIRMATION.md)"],
  ["organski sertifikovani proizvodi", "unsupported organic-certification claim"],
  ["organski sertifikat", "unsupported organic-certification claim"],
  ["jača imunitet", "unconfirmed health claim (CLIENT-CONFIRMATION.md)"],
  ["jaca imunitet", "unconfirmed health claim (CLIENT-CONFIRMATION.md)"],
  ["leči ", "unconfirmed medical claim (CLIENT-CONFIRMATION.md)"],
  ["leci ", "unconfirmed medical claim (CLIENT-CONFIRMATION.md)"],
  ["detoks", "unconfirmed health claim (CLIENT-CONFIRMATION.md)"],
  ["detox", "unconfirmed health claim (CLIENT-CONFIRMATION.md)"],
  ["Besplatna dostava širom Srbije", "unsupported nationwide delivery claim"],
  ["0,8 l", "outdated syrup volume (client email 26 Sep 2026: 0,75 l)"],
  ["podizanja imuniteta", "health claim (AI promo image, never client copy)"],
];
for (const [needle, label] of forbidden) {
  if (source.toLocaleLowerCase("sr").includes(needle.toLocaleLowerCase("sr"))) errors.push(`Found ${label}: ${needle}`);
}

const navSource = fs.readFileSync(path.join(root, "src/data/siteContent.ts"), "utf8");
const pageSource = sourceFiles.filter((file) => file.endsWith(".tsx")).map((file) => fs.readFileSync(file, "utf8")).join("\n");
const hrefTargets = [...navSource.matchAll(/href:\s*["']#([^"']+)["']/g)].map((match) => match[1]);
const ids = new Set([...pageSource.matchAll(/id=["']([^"']+)["']/g)].map((match) => match[1]));
// Hard-coded in-page links in components (skip link, logo, CTAs) too.
hrefTargets.push(...[...pageSource.matchAll(/href=["']#([^"']+)["']/g)].map((match) => match[1]));
for (const target of new Set(hrefTargets)) {
  if (!ids.has(target)) errors.push(`In-page link #${target} has no matching static id.`);
}

// Regex lookbehind is a parse-time SyntaxError before Safari 16.4: one
// occurrence takes down every client chunk that imports the module.
for (const file of sourceFiles.filter((name) => /\.(ts|tsx)$/.test(name) && name.includes(`${path.sep}src${path.sep}`))) {
  if (/\(\?<[=!]/.test(fs.readFileSync(file, "utf8"))) errors.push(`Regex lookbehind in ${path.relative(root, file)} (breaks Safari < 16.4).`);
}

// The catalogue follows the client's current labels (email + photos, 26 Sep
// 2026): every entry is either on a current label or awaiting
// reconfirmation, and every category has products.
const productMatches = navSource.match(/(?:onLabel|toConfirm)\(\{/g)?.length ?? 0;
if (productMatches < 10) errors.push(`Expected at least 10 catalog entries; found ${productMatches}.`);
if (/\blegacy\(\{/.test(navSource)) errors.push("Legacy (scraped) catalog entries are back; the range must follow the client's labels.");
if (/"sokovi"/.test(navSource)) errors.push("The discontinued 0,3 l sokovi category is back in the catalog.");
const categoryKeys = [...navSource.matchAll(/^  (\w+): \{\n    label:/gm)].map((match) => match[1]);
for (const key of categoryKeys) {
  if (!navSource.includes(`category: "${key}"`)) errors.push(`Category ${key} has no products.`);
}
for (const match of navSource.matchAll(/category: "(\w+)"/g)) {
  if (!categoryKeys.includes(match[1])) errors.push(`Product category ${match[1]} has no categoryCopy entry.`);
}
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
  ["menu trap covers toggle", header.includes("toggleNode, ...panel")],
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
  ["honey static fallback without JS", /@media \(scripting: none\), \(prefers-reduced-motion: reduce\) \{\s*\.honey-harvest \{ height: auto/.test(css)],
  // Journey static fallback: no-JS and reduced motion get one complete frame.
  ["journey static fallback", css.includes("@media (scripting: none), (prefers-reduced-motion: reduce)") && css.includes('.journey:not(.is-live) .journey__plate[data-plate="3"]')],
  // HP-08: static bee poses for no-JS first paint.
  ["journey bee fallback pose", journey.includes("translate(${PERCHES[LAST][0]} ${PERCHES[LAST][1]})")],
  ["journey horizon progress", journey.includes("journey__progress") && css.includes(".journey__progress")],
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
  // The every-6th feature card and the row-closing rules exist only at desktop
  // widths, so they can never leak into the two-column or phone layouts.
  ["feature card scoped to desktop", /@media \(min-width: 1081px\) \{\s*\.product-card:nth-child\(6n\),/.test(css) && !/^\.product-card:nth-child\(6n\) \{/m.test(css)],
  // HP-03/05/09: camera-framed responsive scenes.
  ["scene camera", honey.includes("cameraShift(")],
  // HP-04: sequential chapter handoff aligned to visual actions (never a
  // symmetric crossfade sharing coordinates at equal opacity).
  ["chapter handoff windows", honey.includes("fade(copyARef.current, -0.05, 0.0, 0.3, 0.325)")],
  // Sequential phase beats with an explicit retract before takeoff.
  ["drink phase timeline", honey.includes("RETRACT .40–.45") && honey.includes("1 - phaseProgress(progress, 0.4, 0.45)")],
  ["honey exit lift", honey.includes("(1 - exit) * 22")],
  // One coordinate system: bee, drop, stream and comb share viewBox units;
  // a single fill rect replaces 42 transition-chasing cells.
  ["shared pour geometry", honey.includes("POUR_X = 592") && honey.includes("STREAM_BOT_Y = 366")],
  ["single comb fill", honey.includes("honey-fill-level") && !honey.includes("honeycomb-3d") && !css.includes(".honeycomb-3d")],
  ["no scrubbed transitions", !css.includes("transition: transform .05s") && !css.includes("transition: opacity .06s")],
  ["time-clocked flap", honey.includes("flapT") && honey.includes("Math.sin(flapT * 0.35)")],
  ["page-bee exclusions", bee.includes('[data-page-bee="hide"]')],
  ["exclusion beats end fallback", bee.indexOf("excluded === 1") < bee.indexOf("progress > 0.985")],
  // Chapter selection with hysteresis: boundary jitter never toggles.
  ["journey hysteresis", journey.includes("HYSTERESIS") && journey.includes("chapterFor(")],
  // Explicit rows: hiding the top row in short landscape must not shift
  // the stage into an auto-sized track (collapsed stage regression).
  ["journey explicit grid rows", css.includes(".journey__stage { grid-row: 2;") && css.includes(".journey__index { grid-row: 4;")],
  ["journey four chapters", (journey.match(/ word: "/g) ?? []).length === 4],
  ["translate-only reveals", !css.includes("opacity .6s cubic-bezier(.22,.8,.24,1) var(--reveal-delay")],
  ["semantic reveal roles", read("src/components/MotionOrchestrator.tsx").includes("roleBase")],
  // Delivery atlas: the route draws once and the bee bobs three times, then
  // rests; reduced motion shows the finished plate with no motion at all.
  ["map motion finite and reduced-static", css.includes(".delivery-map .at-bee__bob { animation:none !important; }") && css.includes("atBeeBob 3.4s ease-in-out 1.8s 3") && !/routeDrift|mapPulse/.test(css)],
  ["valid reveal transition", css.includes("transition: translate .7s cubic-bezier(.22,.8,.24,1) var(--reveal-delay,0ms);")],
  // Ingredients: foundation vs flavour layers come from data roles; the two
  // foundations are captioned on the plate; no decorative numbering.
  ["ingredient roles", (navSource.match(/role: "base" }/g) ?? []).length === 2 && read("src/components/IngredientsSection.tsx").includes('item.role === "base"')],
  ["ingredient plate captions", read("src/components/IngredientsSection.tsx").includes("ingredients-plate__captions")],
  ["ingredient spread areas", css.includes('grid-template-areas: "plate head" "plate index";')],
  ["no ingredient numbering", !read("src/components/IngredientsSection.tsx").includes("padStart")],
  ["landscape chapter clearance", css.includes(".honey-harvest__chapter { top: calc(var(--header-height) + 10px); translate: none;")],
  // HP-16/36/37/40: one controlled scheduler for the three scenes.
  ["shared scene loop", journey.includes("createSceneLoop(") && honey.includes("createSceneLoop(") && bee.includes("createSceneLoop(")],
  // HP-07: AA contrast tokens.
  ["contrast tokens", css.includes("--muted: #585e59") && css.includes("--honey-dark: #7a4f0e")],
  // HP-28: labelled generic containers carry roles.
  ["labelled div roles", ![...source.matchAll(/<div[^>]*aria-label[^>]*>/g)].some((m) => !/role=/.test(m[0]))],
  // axe follow-ups: dialog on div, unlabelled brand mark.
  ["dialog semantics", !/<aside[^>]*role="dialog"/.test(drawer) && drawer.includes('role="dialog"')],
  ["brand mark naming", !read("src/components/BrandMark.tsx").includes("aria-label")],
  // HP-30/42 + HP-41 + HP-R2-01: button reset + variable-driven clearance.
  // Clearance now lives on the scroll container (scroll-padding-top) so
  // native focus scrolling honours it too; anchors add --anchor-clearance.
  ["text-link reset", css.includes("background: transparent;") && css.includes("html { scroll-padding-top: var(--header-height); }") && css.includes("section[id] { scroll-margin-top: var(--anchor-clearance); }")],
  // HP-R2-03: fresh production-server ownership by default.
  ["fresh test server default", read("playwright.config.ts").includes('process.env.PW_REUSE_EXISTING_SERVER === "1"')],
  // HP-R2-05: CI enforces the QA chain without deploying.
  ["qa CI workflow", fs.existsSync(path.join(root, ".github/workflows/qa.yml"))],
];
for (const [label, ok] of tripwires) {
  if (!ok) errors.push(`Regression tripwire failed: ${label}.`);
}

if (errors.length) {
  console.error("Verification failed:\n" + errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(`Verification passed: ${sourceFiles.length} source/docs files checked, ${productMatches} catalog entries found.`);
