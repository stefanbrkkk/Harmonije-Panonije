"use client";

import { useRef } from "react";
import { ingredients } from "@/src/data/siteContent";

// Specimen illustrations share one grammar: 1.5px round-cap line drawing,
// selective 8–22% translucent fills, hairline detail. Same hand as the
// BeeJourney panorama and Story artwork, adapted to the dark field.
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
        <path d="M40 8c12 15 19 25 19 35a19 19 0 1 1-38 0c0-10 7-20 19-35Z" fill="rgba(239,201,110,.12)" />
        <path d="M52 14l7-4 7 4v8l-7 4-7-4Z" />
        <path d="M20 62c-4-8-2-16 4-20M28 64c0-9 5-16 13-18M24 70h16" strokeWidth="1.2" />
        <circle cx="18" cy="56" r="3" fill="rgba(251,247,236,.5)" stroke="none" />
        <circle cx="32" cy="58" r="2.4" fill="rgba(251,247,236,.5)" stroke="none" />
      </svg>
    );
  if (kind === "lemon")
    return (
      <svg {...common}>
        <path d="M12 62C26 48 44 36 64 28" />
        <ellipse cx="38" cy="44" rx="24" ry="19" transform="rotate(-16 38 44)" fill="rgba(239,201,110,.1)" />
        <path d="M24 44h28M38 27v34M28 32l20 24M48 32 28 56" strokeWidth="1.1" />
        <path d="M58 30c2-10 10-16 19-15 0 8-6 15-15 17" fill="rgba(239,201,110,.12)" />
        <path d="M18 60c-6-2-10-7-10-13 7 0 12 4 13 11" fill="rgba(239,201,110,.12)" />
      </svg>
    );
  if (kind === "ginger")
    return (
      <svg {...common}>
        <path d="M22 52c-7-3-10-10-7-16 3-5 10-6 15-3 1-7 8-11 15-9 6 2 9 8 7 14 7-1 13 4 13 11 0 8-7 13-15 12-8 4-21 0-28-9Z" fill="rgba(239,201,110,.08)" />
        <path d="M30 40c-4-8-3-18 3-24M46 36c1-9 7-15 15-16" strokeWidth="1.2" />
        <path d="M58 22c3-8 10-12 17-11 0 6-4 11-11 13" fill="rgba(239,201,110,.12)" />
      </svg>
    );
  if (kind === "berry")
    return (
      <svg {...common}>
        <path d="M18 68C24 50 32 32 46 20" />
        <circle cx="48" cy="16" r="9" fill="rgba(146,100,125,.18)" />
        <circle cx="32" cy="28" r="8" fill="rgba(146,100,125,.18)" />
        <circle cx="52" cy="34" r="7" fill="rgba(146,100,125,.18)" />
        <circle cx="36" cy="46" r="8.5" fill="rgba(146,100,125,.18)" />
        <path d="M44 12c2-6 8-9 14-8M28 24c-6-2-12 0-14 5" strokeWidth="1.1" />
      </svg>
    );
  if (kind === "fruit")
    return (
      <svg {...common}>
        <path d="M40 66c-13-4-22-15-20-28 2-14 17-21 29-16 14 6 17 24 8 35-4 6-10 8-17 9Z" fill="rgba(239,201,110,.08)" />
        <path d="M40 22c0-8 3-14 9-18" />
        <path d="M49 8c5-3 11-2 14 2-3 4-9 5-14 4" fill="rgba(239,201,110,.14)" />
        <path d="M28 40c-3 6-3 13 0 19" strokeWidth="1.1" />
      </svg>
    );
  if (kind === "herb")
    return (
      <svg {...common}>
        <path d="M39 69c2-24 4-42 6-58" />
        <path d="M43 33C25 31 16 20 17 9c16-2 27 7 26 24ZM42 45c18-3 28-13 27-25-17 0-27 10-27 25ZM39 56C23 54 14 45 15 35c15-2 24 6 24 21Z" fill="rgba(126,147,121,.14)" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M40 60c-11-5-17-15-15-26 2-9 14-12 22-7 9 6 11 19 4 27-3 4-7 5-11 6Z" fill="rgba(146,100,125,.12)" />
      <path d="M40 54c0 6-2 10-6 14" />
      <path d="M36 28c-8-8-9-18-5-24 6 2 9 8 8 15M44 26c2-10 8-16 15-16 1 7-3 14-11 17M40 30c-1-8 1-15 6-19" fill="rgba(126,147,121,.14)" />
    </svg>
  );
}

const specimenClass = (index: number) => {
  if (index < 2) return "specimen specimen--primary";
  // Row rhythm: ginger/berry/fruit (3 across), herb/vegetable (2 across).
  // Dividers mark followers so the reading path stays obvious.
  if (index === 5) return "specimen specimen--support specimen--wide";
  if (index === 6) return "specimen specimen--support specimen--wide specimen--div";
  if (index === 3 || index === 4) return "specimen specimen--support specimen--div";
  return "specimen specimen--support";
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
          {ingredients.slice(0, 2).map((item, index) => (
            <article className={specimenClass(index)} key={item.name} data-kind={item.kind}>
              <span className="specimen__wash" aria-hidden="true" />
              <div className="specimen__icon"><SpecimenIcon kind={item.kind} /></div>
              <p className="specimen__kicker">Primarni sastojak</p>
              <h3><span className="specimen__num">{String(index + 1).padStart(2, "0")}</span>{item.name}</h3>
              <p>{item.note}</p>
            </article>
          ))}
          <div className="seal" aria-hidden="true">
            <span className="seal__ring" />
            <div className="seal__core">
              <p><span>H</span><strong>+</strong><span>P</span></p>
              <small>sklad sastojaka</small>
            </div>
            <svg className="seal__sprig" viewBox="0 0 120 24" aria-hidden="true">
              <path d="M4 12h36M80 12h36M40 12c-6-6-14-6-18 0 4 6 12 6 18 0ZM80 12c6-6 14-6 18 0-4 6-12 6-18 0Z" />
            </svg>
          </div>
          {ingredients.slice(2).map((item, offset) => {
            const index = offset + 2;
            return (
              <article className={specimenClass(index)} key={item.name} data-kind={item.kind}>
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
