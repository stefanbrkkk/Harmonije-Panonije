import type { ProductCategory } from "@/src/data/siteContent";

const palette: Record<ProductCategory, string> = {
  sirupi: "berry",
  djumbir: "gold",
  busteri: "plum",
  sokovi: "green",
};

/**
 * Decorative label identity is derived from the stable product id, never the
 * visible array index or cart insertion order — filtering or reordering must
 * not shuffle the artwork's number/variant. The label is illustrative, not a
 * reproduction of actual packaging.
 */
function identityFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return { variant: hash % 2 === 0 ? "IMMUNO" : "CRAFT", number: String((hash % 89) + 10).padStart(2, "0") };
}

export function ProductVisual({ category, id, compact = false }: { category: ProductCategory; id: string; compact?: boolean }) {
  const tone = palette[category];
  const isJar = category === "busteri";
  const identity = identityFor(id);
  return (
    <div className={`product-visual product-visual--${tone} ${compact ? "product-visual--compact" : ""}`} aria-hidden="true">
      <span className="product-visual__sun" />
      <span className="product-visual__stem product-visual__stem--a" />
      <span className="product-visual__stem product-visual__stem--b" />
      <span className="product-visual__fruit product-visual__fruit--a" />
      <span className="product-visual__fruit product-visual__fruit--b" />
      <div className={isJar ? "product-jar" : "product-bottle"}>
        <span className={isJar ? "product-jar__lid" : "product-bottle__cap"} />
        <span className={isJar ? "product-jar__body" : "product-bottle__body"} />
        <span className={isJar ? "product-jar__label" : "product-bottle__label"}>
          <small>HARMONIJE</small>
          <strong>{isJar ? "BOOST" : identity.variant}</strong>
          <i>{identity.number}</i>
        </span>
      </div>
    </div>
  );
}
