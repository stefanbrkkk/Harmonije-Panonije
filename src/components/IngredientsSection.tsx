import { ingredients } from "@/src/data/siteContent";

function IngredientIcon({ kind }: { kind: string }) {
  if (kind === "honey") return <svg viewBox="0 0 80 80" aria-hidden="true"><path d="M40 10c15 18 24 31 24 44A24 24 0 1 1 16 54c0-13 9-26 24-44Z" /></svg>;
  if (kind === "lemon") return <svg viewBox="0 0 80 80" aria-hidden="true"><ellipse cx="40" cy="42" rx="28" ry="22" transform="rotate(-16 40 42)"/><path d="M35 21c5-14 18-14 25-5M20 42h40M40 21v42M27 27l26 30M53 27 27 57"/></svg>;
  if (kind === "ginger") return <svg viewBox="0 0 80 80" aria-hidden="true"><path d="M20 54c9-12 16-13 21-8 4 4 1 10 8 11 8 1 9-7 15-5 9 3 7 16-1 20-12 6-38 0-43-18ZM34 44c-9-9-12-22-4-29 7-6 15 3 20 9 4-10 13-15 20-8 8 8-2 20-9 27"/></svg>;
  if (kind === "berry") return <svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="27" cy="43" r="15"/><circle cx="49" cy="36" r="16"/><circle cx="49" cy="57" r="14"/><path d="M38 23c3-13 13-18 26-16M36 22C28 12 16 11 9 16"/></svg>;
  if (kind === "herb") return <svg viewBox="0 0 80 80" aria-hidden="true"><path d="M39 69c2-26 4-45 6-60M43 33C25 31 16 20 17 9c16-2 27 7 26 24ZM42 45c18-3 28-13 27-25-17 0-27 10-27 25ZM39 56C23 54 14 45 15 35c15-2 24 6 24 21Z"/></svg>;
  if (kind === "vegetable") return <svg viewBox="0 0 80 80" aria-hidden="true"><path d="M40 69C19 57 16 37 25 26c8-10 24-8 30 1 10 15 3 32-15 42Z"/><path d="M33 26c-8-10-7-19-2-23 7 3 10 10 9 19M47 25c3-12 10-18 17-17 1 8-5 16-15 21"/></svg>;
  return <svg viewBox="0 0 80 80" aria-hidden="true"><path d="M40 67c-17-5-28-20-25-35 4-17 22-25 36-19 17 7 21 29 10 43-5 7-12 10-21 11Z"/><path d="M46 17c3-10 11-14 19-12 0 7-6 13-16 16"/></svg>;
}

export function IngredientsSection() {
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

        <div className="ingredients-stage">
          <div className="ingredients-stage__center" aria-hidden="true">
            <span>H</span>
            <strong>+</strong>
            <span>P</span>
            <small>sklad sastojaka</small>
          </div>
          {ingredients.map((item, index) => (
            <article className={`ingredient-card ingredient-card--${index + 1}${index < 2 ? " ingredient-card--primary" : ""}`} key={item.name}>
              <div className="ingredient-card__icon"><IngredientIcon kind={item.kind} /></div>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{item.name}</h3>
              <p>{item.note}</p>
            </article>
          ))}
          <svg className="ingredients-stage__orbit" viewBox="0 0 1000 620" aria-hidden="true">
            <ellipse cx="500" cy="310" rx="373" ry="220" />
            <ellipse cx="500" cy="310" rx="250" ry="147" />
            <circle className="orbit-dot orbit-dot--honey" cx="873" cy="310" r="6" />
            <circle className="orbit-dot orbit-dot--berry" cx="250" cy="163" r="5" />
            <circle className="orbit-dot orbit-dot--sage" cx="500" cy="457" r="5" />
          </svg>
          <svg className="ingredients-stage__flora" viewBox="0 0 1000 620" aria-hidden="true">
            <path d="M120 500C150 440 165 390 180 340M140 440c-40-10-58-34-48-56 34 2 52 22 48 56Z" />
            <path d="M880 140C860 190 850 230 848 270M868 210c36-8 54-30 46-52-30 2-48 20-46 52Z" />
            <path d="M820 520c-8-26-6-48 6-66M812 478c-20 2-32 12-34 28 16 4 28-6 34-28Z" />
            <circle cx="205" cy="180" r="4" />
            <circle cx="795" cy="420" r="4" />
            <circle cx="620" cy="110" r="3.4" />
          </svg>
        </div>
      </div>
    </section>
  );
}
