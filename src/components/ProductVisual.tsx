import type { ProductCategory } from "@/src/data/siteContent";

const palette: Record<ProductCategory, string> = {
  sirupi: "berry",
  djumbir: "gold",
  busteri: "plum",
  sokovi: "green",
};

export function ProductVisual({ category, index, compact = false }: { category: ProductCategory; index: number; compact?: boolean }) {
  const tone = palette[category];
  const isJar = category === "busteri";
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
          <strong>{isJar ? "BOOST" : index % 2 === 0 ? "IMMUNO" : "CRAFT"}</strong>
          <i>{String(index + 1).padStart(2, "0")}</i>
        </span>
      </div>
    </div>
  );
}
