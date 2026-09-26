"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { pluralSr } from "@/src/lib/plural";
import { bindSeparators } from "@/src/lib/typography";
import { categoryCopy, products, publishedPrice, type ProductCategory } from "@/src/data/siteContent";
import { ProductVisual } from "./ProductVisual";
import { useCart } from "./CartProvider";
import { UsageStrip } from "./UsageStrip";

const categories: ProductCategory[] = ["sirupi", "djumbir", "busteri"];
const BASE_COUNT = 6;

/**
 * Search normalization policy (HP-22): trim, Serbian-locale lowercase, then
 * fold diacritics (š→s, ž→z, ć→c, č→c) with đ→dj so "djumbir" and "đumbir"
 * match identically. Applied to BOTH the query and the searchable text, and
 * the same normalized value drives filtering and UI state (empty vs active).
 * Results come from the active category; matches in the other categories
 * are offered as one-click tab switches that keep the query.
 */
function normalizeQuery(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("sr")
    .replace(/đ/g, "dj")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function matchesQuery(product: (typeof products)[number], normalized: string) {
  return normalizeQuery([product.name, product.description, ...product.ingredients].join(" ")).includes(normalized);
}

function resultCountText(count: number, total: number, searching: boolean) {
  if (count === 0) return "Nema rezultata u ovoj kategoriji.";
  if (searching) return `${count} ${pluralSr(count, "rezultat", "rezultata", "rezultata")} pretrage.`;
  return count >= total
    ? `Prikazano: ${total} ${pluralSr(total, "proizvod", "proizvoda", "proizvoda")}.`
    : `Prikazano ${count} od ${total}.`;
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
  const searchRef = useRef<HTMLInputElement | null>(null);
  const { add, items, open } = useCart();

  const normalized = normalizeQuery(query);
  const searching = normalized.length > 0;

  const categoryProducts = useMemo(() => {
    return products.filter((product) => {
      if (product.category !== active) return false;
      if (!searching) return true;
      return matchesQuery(product, normalized);
    });
  }, [active, normalized, searching]);

  // While searching, the same query's matches in the other categories.
  const elsewhere = useMemo(() => {
    if (!searching) return [];
    return categories
      .filter((category) => category !== active)
      .map((category) => ({
        category,
        count: products.filter((product) => product.category === category && matchesQuery(product, normalized)).length,
      }))
      .filter((entry) => entry.count > 0);
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

  const switchCategory = (category: ProductCategory, keepQuery = false) => {
    if (category === active) return;
    setEnterIds([]);
    setActive(category);
    setExpanded(false);
    if (!keepQuery) setQuery("");
  };

  // Jump to another category's matches; focus follows to its tab so the
  // triggering button (which unmounts) never drops focus to <body>. The
  // browser counts a tab tucked under the fixed header as "visible", so the
  // scroll that clears the header is done explicitly.
  const showElsewhere = (category: ProductCategory) => {
    switchCategory(category, true);
    const tab = tabRefs.current[categories.indexOf(category)];
    if (!tab) return;
    tab.focus({ preventScroll: true });
    requestAnimationFrame(() => {
      const header = document.querySelector(".site-header")?.getBoundingClientRect().bottom ?? 0;
      const { top, bottom } = tab.getBoundingClientRect();
      if (top < header + 12) window.scrollBy({ top: top - header - 16, behavior: "instant" as ScrollBehavior });
      else if (bottom > window.innerHeight) window.scrollBy({ top: bottom - window.innerHeight + 24, behavior: "instant" as ScrollBehavior });
    });
  };

  const elsewhereLinks = elsewhere.map(({ category, count }) => (
    <button key={category} type="button" className="catalog-elsewhere__link" onClick={() => showElsewhere(category)}>
      {categoryCopy[category].label} <span>({count})</span>
    </button>
  ));

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
      // Expansion inserts cards above the toggle; focus moves to the first
      // new card's action (already in view, where the toggle was) so the
      // revealed products come next in keyboard order. No scroll: the
      // viewport stays where the visitor is reading.
      const firstNew = categoryProducts[baseCount]?.id;
      setEnterIds(categoryProducts.slice(baseCount).map((product) => product.id));
      setExpanded(true);
      if (firstNew) {
        requestAnimationFrame(() => requestAnimationFrame(() => {
          document.querySelector<HTMLElement>(`[data-product="${firstNew}"] .product-card__add`)?.focus({ preventScroll: true });
        }));
      }
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
          <p>Birajte kombinacije koje vas zanimaju i dodajte ih u upit. Ukusi prate sezonu, pa dostupnost i cenu potvrđujemo direktno — bez online plaćanja, registracije ili skrivenih koraka.</p>
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
              ref={searchRef}
              type="search"
              value={query}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
              placeholder="npr. kupina, đumbir, lavanda…"
              autoComplete="off"
            />
          </label>
        </div>

        <div id="catalog-panel" role="tabpanel" aria-labelledby={`tab-${active}`} className="catalog-panel">
          {/* While searching, results sit directly under the field (the
              category intro would push them below a phone keyboard). */}
          <div className="catalog-panel__intro" hidden={searching}>
            <p className="eyebrow eyebrow--quiet">{copy.label}</p>
            <h3>{copy.title}</h3>
            <p>{copy.note}</p>
          </div>

          <p className="catalog-count" role="status">{resultCountText(visible.length, categoryProducts.length, searching)}</p>
          {visible.length > 0 && elsewhere.length > 0 && (
            <p className="catalog-elsewhere">Još poklapanja: {elsewhereLinks}</p>
          )}

          {visible.length > 0 ? (
            <div className="product-grid" key={active}>
              {visible.map((product) => {
                const quantity = items.find((item) => item.product.id === product.id)?.quantity ?? 0;
                const isNew = enterIds.includes(product.id);
                const price = publishedPrice(product);
                return (
                  <article
                    className={`product-card ${isNew ? "product-card--new" : ""}`}
                    key={product.id}
                    data-product={product.id}
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
                      <h4>{bindSeparators(product.name)}</h4>
                      <p>{product.description}</p>
                      <ul aria-label={`Sastojci: ${product.name}`}>
                        {product.ingredients.map((ingredient) => <li key={ingredient}>{ingredient}</li>)}
                      </ul>
                      <button
                        type="button"
                        className={`product-card__add ${quantity ? "is-added" : ""}`}
                        onClick={() => add(product, { notify: true })}
                        aria-label={quantity ? `U upitu · ${quantity}: ${product.name}, dodaj još` : `Dodaj u upit: ${product.name}`}
                      >
                        <span>{quantity ? `U upitu · ${quantity}` : "Dodaj u upit"}</span><i aria-hidden="true">{quantity ? "✓" : "+"}</i>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="catalog-empty">
              <strong>Nema poklapanja za „{query.trim()}“ u ovoj kategoriji.</strong>
              {elsewhere.length > 0 ? (
                <p className="catalog-elsewhere">Pronađeno u: {elsewhereLinks}</p>
              ) : (
                <p>Probajte drugi sastojak ili otvorite neku od ostalih kategorija.</p>
              )}
              <button
                type="button"
                className="text-link"
                onClick={() => {
                  setQuery("");
                  // The button unmounts with the empty state: keep focus in
                  // the search field instead of dropping it to <body>.
                  searchRef.current?.focus();
                }}
              >
                Obriši pretragu <span aria-hidden="true">↗</span></button>
            </div>
          )}

          {!searching && categoryProducts.length > BASE_COUNT && (
            <div className="catalog-more">
              <button ref={moreRef} type="button" className="button button--outline" aria-expanded={expanded} onClick={toggleExpanded}>
                {expanded ? "Prikaži manje" : `Prikaži svih ${categoryProducts.length}`}
              </button>
            </div>
          )}

          <UsageStrip />

          <div className="catalog-assurance">
            <p><strong>Bez online naplate.</strong> Izbor samo priprema jasan upit za aktuelnu cenu i dostupnost.</p>
            <button type="button" className="text-link" onClick={open}>Otvori moj upit <span aria-hidden="true">↗</span></button>
          </div>
        </div>
      </div>
    </section>
  );
}
