"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { categoryCopy, products, siteConfig, type ProductCategory } from "@/src/data/siteContent";
import { ProductVisual } from "./ProductVisual";
import { useCart } from "./CartProvider";

const categories: ProductCategory[] = ["sirupi", "djumbir", "busteri", "sokovi"];

export function ProductCatalog() {
  const [active, setActive] = useState<ProductCategory>("sirupi");
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [transitionKey, setTransitionKey] = useState(0);
  const [newFrom, setNewFrom] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const { add, items, open } = useCart();

  const categoryProducts = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("sr");
    return products.filter((product) => {
      if (product.category !== active) return false;
      if (!normalized) return true;
      return [product.name, product.description, ...product.ingredients]
        .join(" ")
        .toLocaleLowerCase("sr")
        .includes(normalized);
    });
  }, [active, query]);

  const visible = expanded || query ? categoryProducts : categoryProducts.slice(0, 6);
  const copy = categoryCopy[active];
  const baseCount = Math.min(6, categoryProducts.length);

  const switchCategory = (category: ProductCategory) => {
    if (category === active) return;
    setNewFrom(0);
    setActive(category);
    setExpanded(false);
    setQuery("");
    setTransitionKey((value) => value + 1);
  };

  const toggleExpanded = () => {
    // Preserve visible cards: only newly inserted cards animate.
    setNewFrom(expanded ? categoryProducts.length : baseCount);
    setExpanded((value) => !value);
    setTransitionKey((value) => value + 1);
  };

  const onTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % categories.length;
    if (event.key === "ArrowLeft") next = (index - 1 + categories.length) % categories.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = categories.length - 1;
    switchCategory(categories[next]);
    requestAnimationFrame(() => tabRefs.current[next]?.focus());
  };

  useEffect(() => {
    const timer = setTimeout(() => setExpanded(false), 0);
    return () => clearTimeout(timer);
  }, [active]);

  return (
    <section id="proizvodi" className="product-section section-paper">
      <div className="shell">
        <div className="section-heading section-heading--split">
          <div>
            <p className="eyebrow"><span />Immuno Craft</p>
            <h2>Ukusi koji imaju karakter.</h2>
          </div>
          <p>Birajte kombinacije koje vas zanimaju i dodajte ih u upit. Aktuelnu dostupnost i cenu proizvođač potvrđuje direktno — bez checkouta, naloga ili skrivenih koraka.</p>
        </div>

        <div className="catalog-toolbar">
          <div className="catalog-tabs" role="tablist" aria-label="Kategorije proizvoda">
            {categories.map((category, index) => (
              <button
                key={category}
                ref={(node: HTMLButtonElement | null) => { tabRefs.current[index] = node; }}
                id={`tab-${category}`}
                type="button"
                role="tab"
                aria-selected={active === category}
                aria-controls="catalog-panel"
                tabIndex={active === category ? 0 : -1}
                className={active === category ? "is-active" : ""}
                onClick={() => switchCategory(category)}
                onKeyDown={(event: React.KeyboardEvent<HTMLButtonElement>) => onTabKeyDown(event, index)}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>{categoryCopy[category].label}
              </button>
            ))}
          </div>
          <label className="catalog-search">
            <span>Pretraži ukuse</span>
            <input
              type="search"
              value={query}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
              placeholder="npr. malina, đumbir, nana…"
              autoComplete="off"
            />
          </label>
        </div>

        <div id="catalog-panel" role="tabpanel" aria-labelledby={`tab-${active}`} className="catalog-panel">
          <div className="catalog-panel__intro">
            <p className="eyebrow eyebrow--quiet">{copy.label}</p>
            <h3>{copy.title}</h3>
            <p>{copy.note}</p>
          </div>

          {visible.length > 0 ? (
            <div className="product-grid catalog-enter" key={`${active}-${transitionKey}`}>
              {visible.map((product, index) => {
                const quantity = items.find((item) => item.product.id === product.id)?.quantity ?? 0;
                const isNew = index >= newFrom;
                return (
                  <article
                    className={`product-card ${product.featured ? "product-card--featured" : ""} ${isNew ? "product-card--new" : ""}`}
                    key={product.id}
                    style={isNew ? { animationDelay: `${Math.min(240, (index - newFrom) * 45)}ms` } : undefined}
                  >
                    <div className="product-card__visual">
                      <ProductVisual category={product.category} index={index} />
                      <span className="product-card__availability">Dostupnost po upitu</span>
                    </div>
                    <div className="product-card__body">
                      <div className="product-card__meta">
                        <span>{product.volume}</span>
                        <span>{siteConfig.showLegacyPublicPricing && product.legacyPriceRsd ? `${product.legacyPriceRsd} RSD*` : "Cena po upitu"}</span>
                      </div>
                      <h4>{product.name}</h4>
                      <p>{product.description}</p>
                      <ul aria-label={`Sastojci za ${product.name}`}>
                        {product.ingredients.map((ingredient) => <li key={ingredient}>{ingredient}</li>)}
                      </ul>
                      <button type="button" className={`product-card__add ${quantity ? "is-added" : ""}`} onClick={() => add(product, { notify: true })}>
                        <span>{quantity ? `U upitu · ${quantity}` : "Dodaj u upit"}</span><i aria-hidden="true">{quantity ? "✓" : "+"}</i>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="catalog-empty">
              <strong>Nema poklapanja za „{query}“.</strong>
              <p>Probajte drugi sastojak ili otvorite neku od ostalih kategorija.</p>
              <button type="button" className="text-link" onClick={() => setQuery("")}>Obriši pretragu <span aria-hidden="true">↗</span></button>
            </div>
          )}

          {!query && categoryProducts.length > 6 && (
            <div className="catalog-more">
              <button type="button" className="button button--outline" onClick={toggleExpanded}>
                {expanded ? "Prikaži manje" : `Prikaži svih ${categoryProducts.length}`}
              </button>
            </div>
          )}

          <div className="catalog-assurance">
            <p><strong>Bez online naplate.</strong> Izbor samo priprema jasan upit za aktuelnu cenu i dostupnost.</p>
            <button type="button" className="text-link" onClick={open}>Otvori moj upit <span aria-hidden="true">↗</span></button>
          </div>
        </div>
      </div>
    </section>
  );
}
