"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { categoryCopy, products, publishedPrice, type ProductCategory } from "@/src/data/siteContent";
import { ProductVisual } from "./ProductVisual";
import { useCart } from "./CartProvider";

const categories: ProductCategory[] = ["sirupi", "djumbir", "busteri", "sokovi"];
const BASE_COUNT = 6;

/**
 * Search normalization policy (HP-22): trim, Serbian-locale lowercase, then
 * fold diacritics (š→s, ž→z, ć→c, č→c) with đ→dj so "djumbir" and "đumbir"
 * match identically. Applied to BOTH the query and the searchable text, and
 * the same normalized value drives filtering and UI state (empty vs active).
 * Scope is the active category only.
 */
function normalizeQuery(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("sr")
    .replace(/đ/g, "dj")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function resultCountText(count: number, total: number, searching: boolean) {
  if (count === 0) return "Nema rezultata.";
  const noun = count % 10 === 1 && count % 100 !== 11 ? "rezultat" : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14) ? "rezultata" : "rezultata";
  if (searching) return `${count} ${noun} pretrage.`;
  return count >= total ? `Prikazano svih ${total}.` : `Prikazano ${count} od ${total}.`;
}

export function ProductCatalog() {
  const [active, setActive] = useState<ProductCategory>("sirupi");
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  // Ids of cards allowed to run the enter animation. Expansion appends to the
  // existing grid (no remount), so only these animate; everything else keeps
  // its DOM identity and stays put.
  const [enterIds, setEnterIds] = useState<string[]>([]);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const moreRef = useRef<HTMLButtonElement | null>(null);
  const { add, items, open } = useCart();

  const normalized = normalizeQuery(query);
  const searching = normalized.length > 0;

  const categoryProducts = useMemo(() => {
    return products.filter((product) => {
      if (product.category !== active) return false;
      if (!searching) return true;
      return normalizeQuery([product.name, product.description, ...product.ingredients].join(" ")).includes(normalized);
    });
  }, [active, normalized, searching]);

  const visible = expanded || searching ? categoryProducts : categoryProducts.slice(0, BASE_COUNT);
  const copy = categoryCopy[active];
  const baseCount = Math.min(BASE_COUNT, categoryProducts.length);

  // Clear one-shot enter animations after they finish.
  useEffect(() => {
    if (!enterIds.length) return;
    const timer = window.setTimeout(() => setEnterIds([]), 500);
    return () => window.clearTimeout(timer);
  }, [enterIds]);

  const switchCategory = (category: ProductCategory) => {
    if (category === active) return;
    setEnterIds([]);
    setActive(category);
    setExpanded(false);
    setQuery("");
  };

  const toggleExpanded = () => {
    if (expanded) {
      // Collapse: measure only after React commits the removal (double
      // rAF). A single rAF can still see the 12-card layout, and any
      // correction computed from it scrolls to a stale position. After a
      // real collapse the toggle sits above the viewport (rows removed
      // beneath the reading position), so bring it back to a useful
      // visible position instead of stranding the user.
      setEnterIds([]);
      setExpanded(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const el = moreRef.current;
          if (!el) return;
          const r = el.getBoundingClientRect();
          if (r.top >= 0 && r.bottom <= window.innerHeight) return;
          window.scrollTo({ top: Math.max(0, window.scrollY + r.top - window.innerHeight * 0.4), behavior: "instant" as ScrollBehavior });
        });
      });
    } else {
      setEnterIds(categoryProducts.slice(baseCount).map((product) => product.id));
      setExpanded(true);
    }
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

  return (
    <section id="proizvodi" className="product-section section-paper">
      <div className="shell">
        <div className="section-heading section-heading--split">
          <div>
            <p className="eyebrow"><span />Immuno Craft</p>
            <h2 id="proizvodi-heading" tabIndex={-1}>Ukusi koji imaju karakter.</h2>
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

          <p className="catalog-count" role="status">{resultCountText(visible.length, categoryProducts.length, searching)}</p>

          {visible.length > 0 ? (
            <div className="product-grid" key={active}>
              {visible.map((product) => {
                const quantity = items.find((item) => item.product.id === product.id)?.quantity ?? 0;
                const isNew = enterIds.includes(product.id);
                const price = publishedPrice(product);
                return (
                  <article
                    className={`product-card ${product.featured ? "product-card--featured" : ""} ${isNew ? "product-card--new" : ""}`}
                    key={product.id}
                    style={isNew ? { animationDelay: `${Math.min(240, enterIds.indexOf(product.id) * 45)}ms` } : undefined}
                  >
                    <div className="product-card__visual">
                      <ProductVisual category={product.category} id={product.id} />
                      <span className="product-card__availability">Dostupnost po upitu</span>
                    </div>
                    <div className="product-card__body">
                      <div className="product-card__meta">
                        <span>{product.volume}</span>
                        <span>{price != null ? `${price} RSD` : "Cena po upitu"}</span>
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
              <strong>Nema poklapanja za „{normalized}“.</strong>
              <p>Probajte drugi sastojak ili otvorite neku od ostalih kategorija.</p>
              <button type="button" className="text-link" onClick={() => setQuery("")}>Obriši pretragu <span aria-hidden="true">↗</span></button>
            </div>
          )}

          {!searching && categoryProducts.length > BASE_COUNT && (
            <div className="catalog-more">
              <button ref={moreRef} type="button" className="button button--outline" aria-expanded={expanded} onClick={toggleExpanded}>
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
