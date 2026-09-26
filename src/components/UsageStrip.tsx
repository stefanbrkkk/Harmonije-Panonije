import { usage } from "@/src/data/siteContent";
import { bindShortWords } from "@/src/lib/typography";

/** 28px engraved hairline glyphs in the Botanical.tsx language. */
function Glyph({ kind }: { kind: string }) {
  return (
    <svg className="catalog-ritual__glyph" viewBox="0 0 28 28" aria-hidden="true" focusable="false">
      {kind === "spoon" && (
        <>
          <path d="M5 23 16.5 11.5" />
          <ellipse cx="19.6" cy="8.4" rx="5" ry="3.2" transform="rotate(-45 19.6 8.4)" />
          <path className="catalog-ritual__accent" d="M9.5 21.5c0 1.6 1.3 2.7 1.3 3.6a1.3 1.3 0 0 1-2.6 0c0-.9 1.3-2 1.3-3.6Z" />
        </>
      )}
      {kind === "water" && (
        <>
          <path d="M8 4.5h12l-1.6 19.5H9.6Z" />
          <path d="M8.8 12.5h10.4" />
          <circle cx="12.4" cy="17.5" r="1" />
          <circle cx="15.6" cy="15" r=".8" />
          <circle cx="14.2" cy="20.4" r=".7" />
        </>
      )}
      {kind === "coupe" && (
        <>
          <path d="M4.5 8h17c0 5.4-4 8-8.5 8S4.5 13.4 4.5 8Z" />
          <path d="M13 16v7.5M8.5 23.5h9" />
          <circle className="catalog-ritual__accent" cx="21.5" cy="7.5" r="3.2" />
          <path d="M21.5 4.3v6.4M18.3 7.5h6.4" />
        </>
      )}
      {kind === "morning" && (
        <>
          <path d="M3 19.5h22" />
          <path className="catalog-ritual__accent" d="M8 19.5a6 6 0 0 1 12 0Z" />
          <path d="M14 8.5v3M6.8 11.6l2 2M21.2 11.6l-2 2M4 16h2.4M21.6 16H24" />
        </>
      )}
    </svg>
  );
}

/**
 * "Kako se pije sirup": serving and storage from the client (26 Sep 2026),
 * set like the back label of an apothecary bottle. Syrups only — nothing is
 * claimed for the Immuno Booster jars.
 */
export function UsageStrip() {
  return (
    <div className="catalog-ritual" role="group" aria-labelledby="kako-se-pije">
      <div className="catalog-ritual__lead">
        <h3 id="kako-se-pije" className="eyebrow eyebrow--quiet"><span />{usage.eyebrow}</h3>
        <p className="catalog-ritual__statement">
          {usage.statement.lead} <em>{usage.statement.amount}</em> {usage.statement.tail}
        </p>
        <p className="catalog-ritual__note">{bindShortWords(usage.note)}</p>
      </div>
      <dl className="catalog-ritual__ways">
        {usage.ways.map((way) => (
          <div key={way.key}>
            <Glyph kind={way.key} />
            <dt>{bindShortWords(way.title)}</dt>
            <dd>{bindShortWords(way.text)}</dd>
          </div>
        ))}
      </dl>
      <p className="catalog-ritual__keep"><strong>Čuvanje</strong> {bindShortWords(usage.storage)}</p>
    </div>
  );
}
