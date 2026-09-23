"use client";

import { useRef } from "react";
import { ingredients } from "@/src/data/siteContent";

// Editorial specimen illustrations share one grammar: 1.5px round-cap
// line drawing, sparse semantic fills (gold/sage/berry 8–18%), hairline
// detail. Same hand as the BeeJourney panorama, adapted to the dark field.
function SpecimenIcon({ kind }: { kind: string }) {
  const common = {
    viewBox: "0 0 80 80",
    "aria-hidden": true,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  } as const;
  if (kind === "honey")
    return (
      <svg {...common}>
        <path d="M36 6c13 16 21 27 21 38a21 21 0 1 1-42 0c0-11 8-22 21-38Z" fill="rgba(239,201,110,.12)" />
        <path d="M36 22c6 8 10 13 10 19a10 10 0 1 1-20 0c0-6 4-11 10-19Z" strokeWidth="1.2" />
        <path d="M56 12l8-5 8 5v9l-8 5-8-5Z" />
        <path d="M60 52c-3-9 0-18 7-22M68 54c3-9 10-15 19-15" strokeWidth="1.2" />
        <ellipse cx="72" cy="34" rx="4" ry="6" fill="rgba(251,247,236,.4)" stroke="none" />
        <ellipse cx="62" cy="40" rx="3.4" ry="5" fill="rgba(251,247,236,.4)" stroke="none" />
        <circle cx="16" cy="60" r="3" fill="rgba(251,247,236,.5)" stroke="none" />
        <circle cx="26" cy="63" r="2.4" fill="rgba(251,247,236,.5)" stroke="none" />
        <path d="M12 68h18" strokeWidth="1.2" />
      </svg>
    );
  if (kind === "lemon")
    return (
      <svg {...common}>
        <path d="M8 64C22 50 40 38 62 30" />
        <ellipse cx="36" cy="46" rx="25" ry="20" transform="rotate(-16 36 46)" fill="rgba(239,201,110,.1)" />
        <path d="M22 46h28M36 29v34M27 34l18 24M45 34 27 58" strokeWidth="1.1" />
        <path d="M56 32c2-11 11-18 21-17 0 9-7 17-17 19" fill="rgba(239,201,110,.12)" />
        <path d="M14 62c-7-2-11-8-11-15 8 0 14 5 15 13" fill="rgba(239,201,110,.12)" />
        <circle cx="62" cy="58" r="9" strokeWidth="1.2" />
        <path d="M62 52v12M56 58h12M58 54l8 8M66 54l-8 8" strokeWidth="1" />
      </svg>
    );
  if (kind === "ginger")
    return (
      <svg {...common}>
        <path d="M18 54c-8-4-11-12-8-19 3-6 11-7 16-4 0-8 7-13 15-12 7 1 11 7 10 14 8-2 15 3 15 11 0 9-8 14-17 13-9 5-23 2-31-3Z" fill="rgba(239,201,110,.08)" />
        <path d="M28 44c-5-8-5-18 0-26M44 40c0-9 5-17 13-20" strokeWidth="1.2" />
        <path d="M50 22c2-8 9-13 17-12 1 7-4 13-12 15" fill="rgba(126,147,121,.16)" />
        <path d="M60 14c1-4 4-7 8-8" strokeWidth="1.1" />
      </svg>
    );
  if (kind === "berry")
    return (
      <svg {...common}>
        <path d="M14 70C20 52 28 34 42 22" />
        <path d="M14 70c8-16 20-28 36-36" strokeWidth="1.2" />
        <circle cx="44" cy="18" r="9" fill="rgba(146,100,125,.2)" />
        <circle cx="28" cy="30" r="8" fill="rgba(146,100,125,.2)" />
        <circle cx="50" cy="36" r="7" fill="rgba(146,100,125,.2)" />
        <circle cx="32" cy="48" r="8.5" fill="rgba(146,100,125,.2)" />
        <circle cx="56" cy="52" r="6" fill="rgba(146,100,125,.2)" />
        <path d="M40 14c2-6 8-9 14-8M24 26c-6-2-12 0-14 5" strokeWidth="1.1" />
        <circle cx="62" cy="62" r="2.2" fill="rgba(146,100,125,.6)" stroke="none" />
      </svg>
    );
  if (kind === "fruit")
    return (
      <svg {...common}>
        <path d="M38 68c-14-5-23-16-21-30 2-15 18-22 31-17 15 6 19 25 10 37-4 6-11 9-20 10Z" fill="rgba(239,201,110,.08)" />
        <path d="M38 24c0-9 3-15 9-20" />
        <path d="M47 8c6-3 12-2 15 3-3 4-10 5-15 3" fill="rgba(126,147,121,.16)" />
        <path d="M26 42c-3 7-3 14 0 20" strokeWidth="1.1" />
        <path d="M58 30c4-6 11-8 17-6" strokeWidth="1.2" />
      </svg>
    );
  if (kind === "herb")
    return (
      <svg {...common}>
        <path d="M39 71c2-26 4-46 6-64" />
        <path d="M43 33C25 31 16 20 17 9c16-2 27 7 26 24ZM42 45c18-3 28-13 27-25-17 0-27 10-27 25ZM39 56C23 54 14 45 15 35c15-2 24 6 24 21ZM41 63c14-2 22-9 22-18-13 0-21 7-22 18Z" fill="rgba(126,147,121,.15)" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M40 58c-12-5-18-16-16-27 2-10 15-13 23-8 10 6 12 20 5 29-3 4-8 5-12 6Z" fill="rgba(146,100,125,.13)" />
      <path d="M40 52c0 7-2 12-6 16" />
      <path d="M34 26C26 18 25 8 29 4c6 2 9 9 8 16M44 24c2-10 8-16 15-16 1 7-3 14-11 17M39 28c-1-8 1-15 6-19" fill="rgba(126,147,121,.15)" />
      <path d="M30 44c-4 4-5 9-4 14" strokeWidth="1.1" />
    </svg>
  );
}

// Editorial rhythm: heroes dominate at staggered levels; fruit runs
// horizontal; ginger stays compact; herbs run wide horizontal.
const specimenClass = (index: number) => {
  if (index === 0) return "specimen specimen--primary specimen--honey";
  if (index === 1) return "specimen specimen--primary specimen--lemon";
  if (index === 4) return "specimen specimen--support specimen--div specimen--horizontal specimen--span5";
  if (index === 2) return "specimen specimen--support specimen--compact specimen--div";
  if (index === 3) return "specimen specimen--support specimen--div";
  if (index === 5) return "specimen specimen--support specimen--wide specimen--horizontal";
  return "specimen specimen--support specimen--div specimen--span5";
};

export function IngredientsSection() {
  const atlasRef = useRef<HTMLDivElement>(null);
  const onPointerMove = (event: React.PointerEvent) => {
    const node = atlasRef.current;
    if (!node || (event.pointerType !== "mouse" && event.pointerType !== "pen")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = node.getBoundingClientRect();
    node.style.setProperty("--mx", `${(((event.clientX - rect.left) / rect.width) * 100).toFixed(1)}%`);
    node.style.setProperty("--my", `${(((event.clientY - rect.top) / rect.height) * 100).toFixed(1)}%`);
  };

  return (
    <section id="sastojci" data-page-bee="hide" className="ingredients-section section-dark">
      <div className="shell">
        <div className="section-heading section-heading--split section-heading--light">
          <div>
            <p className="eyebrow eyebrow--light"><span />Sastojci</p>
            <h2>Šta ulazi u harmoniju?</h2>
          </div>
          <p>Livadski med i ceđeni limun povezuju mnoge Immuno Craft kombinacije. Ukusi se zatim grade voćem, bobicama, povrćem, đumbirom i biljem.</p>
        </div>

        <div ref={atlasRef} className="ingredients-atlas" onPointerMove={onPointerMove}>
          <svg className="atlas-ghost" viewBox="0 0 300 300" aria-hidden="true">
            <path d="M150 20C160 90 165 160 150 240M150 80c-40-8-70-34-72-70 36-6 64 22 72 70ZM150 140c44-6 74-34 72-72-38 0-68 26-72 72ZM150 200c-34-4-58-26-58-56 30-4 54 18 58 56Z" />
          </svg>
          {ingredients.slice(0, 2).map((item, index) => (
            <article className={specimenClass(index)} key={item.name} data-kind={item.kind} data-num={String(index + 1).padStart(2, "0")}>
              <span className="specimen__wash" aria-hidden="true" />
              <div className="specimen__icon"><SpecimenIcon kind={item.kind} /></div>
              <p className="specimen__kicker">Primarni sastojak</p>
              <h3><span className="specimen__num">{String(index + 1).padStart(2, "0")}</span>{item.name}</h3>
              <p>{item.note}</p>
            </article>
          ))}
          <div className="seal" aria-hidden="true">
            <span className="seal__ring">
              <span className="seal__core">
                <span className="seal__monogram"><span>H</span><strong>+</strong><span>P</span></span>
                <small>sklad sastojaka</small>
              </span>
            </span>
            <svg className="seal__sprig" viewBox="0 0 120 24" aria-hidden="true">
              <path d="M4 12h36M80 12h36M40 12c-6-6-14-6-18 0 4 6 12 6 18 0ZM80 12c6-6 14-6 18 0-4 6-12 6-18 0Z" />
            </svg>
          </div>
          {ingredients.slice(2).map((item, offset) => {
            const index = offset + 2;
            return (
              <article className={specimenClass(index)} key={item.name} data-kind={item.kind} data-num={String(index + 1).padStart(2, "0")}>
                <span className="specimen__wash" aria-hidden="true" />
                <div className="specimen__icon"><SpecimenIcon kind={item.kind} /></div>
                <h3><span className="specimen__num">{String(index + 1).padStart(2, "0")}</span>{item.name}</h3>
                <p>{item.note}</p>
              </article>
            );
          })}
          <svg className="atlas-flora" viewBox="0 0 1000 620" aria-hidden="true">
            <path d="M120 500C150 440 165 390 180 340M140 440c-40-10-58-34-48-56 34 2 52 22 48 56Z" />
            <path d="M880 140C860 190 850 230 848 270M868 210c36-8 54-30 46-52-30 2-48 20-46 52Z" />
            <circle cx="205" cy="180" r="4" />
            <circle cx="795" cy="420" r="4" />
            <circle cx="620" cy="110" r="3.4" />
          </svg>
        </div>
      </div>
    </section>
  );
}
