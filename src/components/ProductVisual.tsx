import { useId, type CSSProperties } from "react";
import { products, type ProductCategory, type ProductVisualSpec } from "@/src/data/siteContent";

const FALLBACK: ProductVisualSpec = { liquid: "#c9a24a", band: "#c9a24a", cap: "#e6dfd0", capPattern: "linen", line: "Craft sirupi" };
const CREAM = "#efe6d4";

/**
 * Artwork identity is looked up by the stable product id, never the visible
 * array index or cart insertion order — filtering or reordering must not
 * shuffle a bottle's colours. The drawing follows the real packaging (tall
 * bottle or jar, fabric cap tied with jute, the white gable-house label with
 * the flavour's colour band); the label text is illustrative.
 */
function identityFor(id: string): ProductVisualSpec {
  return products.find((product) => product.id === id)?.visual ?? FALLBACK;
}

function mix(hex: string, base: string, amount: number) {
  const channel = (value: string, at: number) => parseInt(value.slice(at, at + 2), 16);
  const blend = (at: number) => Math.round(channel(base, at) * (1 - amount) + channel(hex, at) * amount);
  return `#${[1, 3, 5].map((at) => blend(at).toString(16).padStart(2, "0")).join("")}`;
}

/** Fabric for the cap: gingham check, plain cotton or unbleached linen. */
function CapPattern({ id, spec }: { id: string; spec: ProductVisualSpec }) {
  if (spec.capPattern === "gingham") {
    return (
      <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(8)">
        <rect width="6" height="6" fill="#fbf8f1" />
        <rect width="3" height="6" fill={spec.cap} opacity=".5" />
        <rect width="6" height="3" fill={spec.cap} opacity=".5" />
      </pattern>
    );
  }
  return (
    <pattern id={id} width="3" height="3" patternUnits="userSpaceOnUse">
      <rect width="3" height="3" fill={spec.cap} />
      <path d="M0 1.5h3M1.5 0v3" stroke="#fff" strokeOpacity={spec.capPattern === "linen" ? ".3" : ".16"} strokeWidth=".5" />
    </pattern>
  );
}

/** The label: a white die-cut Vojvodina gable facade with a gold hairline, bee mark and colour band. */
function Label({ spec, jar }: { spec: ProductVisualSpec; jar: boolean }) {
  const [first, second] = spec.line === "Immuno Booster" ? ["Immuno", "Booster"] : [spec.line, "sa medom"];
  return (
    <g className="pv-label">
      <path
        className="pv-label__face"
        d="M-28 16C-28 9-25 7-22 5.5-19 4-20-1-17-3.5-14-5.5-11-3.5-9-7.5-7-12-4-14.5 0-14.5S7-12 9-7.5C11-3.5 14-5.5 17-3.5 20-1 19 4 22 5.5 25 7 28 9 28 16V80H-28Z"
      />
      <path className="pv-label__gilt" d="M-24 17C-24 12-22 10-19.5 9M24 17C24 12 22 10 19.5 9M-6 -9C-3.5 -11.5 3.5 -11.5 6 -9" />
      <g className="pv-label__bee">
        <ellipse cx="-3.4" cy="-3.2" rx="2.9" ry="1.6" />
        <ellipse cx="3.4" cy="-3.2" rx="2.9" ry="1.6" />
        <circle cx="0" cy="-1.2" r="2.6" />
        <path d="M-1.5 .6a1.9 1.9 0 0 0 3 0Z" />
      </g>
      <path className="pv-label__window" d="M-8 8h4v5h-4ZM4 8h4v5H4Z" />
      <text className="pv-label__line" x="0" y={jar ? 26 : 25}>{first}</text>
      <text className="pv-label__line" x="0" y={jar ? 33.5 : 32.5}>{second}</text>
      <path className="pv-label__ink" d="M-6 42H20M-6 47H16M-6 52H18" />
      <path className="pv-label__door" d="M-23 40h11v24h-11ZM-17.5 40v24" />
      <rect className="pv-label__band" x="-28" y="64" width="56" height="16" fill={spec.band} />
      <path className="pv-label__band-ink" d="M-2 70H20M2 74.5H20" />
    </g>
  );
}

export function ProductVisual({ category, id, compact = false }: { category: ProductCategory; id: string; compact?: boolean }) {
  const spec = identityFor(id);
  const isJar = category === "busteri";
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const capFill = `pv-cap-${uid}`;
  const glassClip = `pv-glass-${uid}`;
  const style = {
    "--pv-wash-a": mix(spec.band, CREAM, 0.1),
    "--pv-wash-b": mix(spec.band, CREAM, 0.26),
    "--pv-accent": spec.band,
  } as CSSProperties;

  return (
    <div
      className={`product-visual ${compact ? "product-visual--compact" : ""}`}
      style={style}
      data-artwork={`${id}:${spec.band}`}
      aria-hidden="true"
    >
      <span className="product-visual__sun" />
      <span className="product-visual__stem product-visual__stem--a" />
      <span className="product-visual__stem product-visual__stem--b" />
      <span className="product-visual__fruit product-visual__fruit--a" />
      <span className="product-visual__fruit product-visual__fruit--b" />
      {isJar ? (
        <div className="product-jar">
          <svg viewBox="0 0 120 152" preserveAspectRatio="xMidYMax meet" focusable="false">
            <defs>
              <CapPattern id={capFill} spec={spec} />
            </defs>
            <ellipse className="pv-shadow" cx="60" cy="149" rx="50" ry="3.5" />
            <rect x="9" y="42" width="102" height="106" rx="11" fill={spec.liquid} />
            <path className="pv-glint" d="M20 58v76" />
            <rect className="pv-shade" x="92" y="46" width="14" height="98" rx="6" />
            <rect className="pv-glass" x="9" y="42" width="102" height="106" rx="11" />
            <g transform="translate(60 72) scale(.86)">
              <Label spec={spec} jar />
            </g>
            <path
              className="pv-cloth"
              d="M7 44C8 28 24 20 60 20S112 28 113 44L110 56 105 51 101 58 96 52 91 59 86 53 81 60 76 54 71 61 66 55 61 62 56 55 51 61 46 54 41 60 36 53 31 59 26 52 22 58 17 51 12 57Z"
              fill={`url(#${capFill})`}
            />
            <path className="pv-twine" d="M8 45C40 52 80 52 112 45" />
            <path className="pv-twine pv-twine--end" d="M92 49c3 5 3 11 0 16M92 49c6 2 10 6 11 12" />
          </svg>
        </div>
      ) : (
        <div className="product-bottle">
          <svg viewBox="0 0 80 244" preserveAspectRatio="xMidYMax meet" focusable="false">
            <defs>
              <CapPattern id={capFill} spec={spec} />
              <clipPath id={glassClip}>
                <path d="M27 36H53V56C53 66 58 71 64 78 71 86 74 92 74 102V229C74 234 70 238 65 238H15C10 238 6 234 6 229V102C6 92 9 86 16 78 22 71 27 66 27 56Z" />
              </clipPath>
            </defs>
            <ellipse className="pv-shadow" cx="40" cy="240" rx="34" ry="3.2" />
            <g clipPath={`url(#${glassClip})`}>
              <rect x="0" y="50" width="80" height="194" fill={spec.liquid} />
              <rect className="pv-headspace" x="0" y="34" width="80" height="16" />
              <path className="pv-glint" d="M13 106V224" />
              <rect className="pv-shade" x="62" y="92" width="10" height="140" rx="5" />
            </g>
            <path
              className="pv-glass"
              d="M27 36H53V56C53 66 58 71 64 78 71 86 74 92 74 102V229C74 234 70 238 65 238H15C10 238 6 234 6 229V102C6 92 9 86 16 78 22 71 27 66 27 56Z"
            />
            <g transform="translate(40 126)">
              <Label spec={spec} jar={false} />
            </g>
            <path className="pv-cloth" d="M24 56C23 36 30 22 40 22S57 36 56 56" fill={`url(#${capFill})`} />
            <path
              className="pv-cloth"
              d="M24 53C18 56 14 61 12 67L17 66 18 71 23 68 26 73 30 69 34 74 37 69 41 74 45 69 49 73 52 68 57 71 58 66 63 67C61 61 57 56 51 53Z"
              fill={`url(#${capFill})`}
            />
            <path className="pv-twine" d="M24 55C34 59 46 59 56 55" />
            <path className="pv-twine pv-twine--end" d="M50 57c4 4 6 10 5 16M50 57c6 1 10 5 12 10" />
          </svg>
        </div>
      )}
    </div>
  );
}
