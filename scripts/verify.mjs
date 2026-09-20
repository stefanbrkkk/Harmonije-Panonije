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

if (errors.length) {
  console.error("Verification failed:\n" + errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(`Verification passed: ${sourceFiles.length} source/docs files checked, ${productMatches} catalog entries found.`);
