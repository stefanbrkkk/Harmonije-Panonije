import { hero } from "@/src/data/siteContent";
import { bindShortWords } from "@/src/lib/typography";

function Bottle({ size = "large", tone = "berry", label = "IMMUNO\nCRAFT" }: { size?: "large" | "small"; tone?: string; label?: string }) {
  return (
    <div className={`hero-bottle hero-bottle--${size} hero-bottle--${tone}`} aria-hidden="true">
      <span className="hero-bottle__cap" />
      <span className="hero-bottle__glass" />
      <span className="hero-bottle__label">
        <small>Harmonije Panonije</small>
        <strong>{label.split("\n").map((line) => <span key={line}>{line}</span>)}</strong>
        <i>med · limun · priroda</i>
      </span>
    </div>
  );
}

export function Hero() {
  return (
    <section id="vrh" className="hero-section section-dark">
      <div className="hero-section__grain" aria-hidden="true" />
      <div className="hero-section__orb hero-section__orb--one" aria-hidden="true" />
      <div className="hero-section__orb hero-section__orb--two" aria-hidden="true" />
      <div className="shell hero-grid">
        <div className="hero-copy">
          <p className="eyebrow eyebrow--light"><span />{hero.eyebrow}</p>
          <h1>{bindShortWords(hero.headline)}</h1>
          <p className="hero-copy__lead">{bindShortWords(hero.subheadline)}</p>
          <div className="hero-copy__actions">
            <a className="button button--honey" href="#proizvodi">{hero.primaryCta}</a>
            <a className="text-link text-link--light" href="#prica">{hero.secondaryCta}<span aria-hidden="true">↘</span></a>
          </div>
          <div className="hero-trust" role="list" aria-label="Osnovne karakteristike">
            {hero.trustPoints.map((point) => <span key={point} role="listitem">{point}</span>)}
          </div>
        </div>

        <div className="hero-art">
          <div className="hero-art__halo" aria-hidden="true" />
          <div className="hero-art__line hero-art__line--a" aria-hidden="true" />
          <div className="hero-art__line hero-art__line--b" aria-hidden="true" />
          <div className="hero-art__ingredient hero-art__ingredient--lemon" aria-hidden="true"><span /></div>
          <div className="hero-art__ingredient hero-art__ingredient--berry" aria-hidden="true"><i /><i /><i /><i /></div>
          <div className="hero-art__ingredient hero-art__ingredient--leaf" aria-hidden="true"><span /><span /><span /></div>
          <div className="hero-art__ingredient hero-art__ingredient--flower" aria-hidden="true"><span /><span /><span /><span /><span /></div>
          <div className="hero-art__bottles">
            <Bottle size="small" tone="gold" label={"CRAFT\nSIRUP"} />
            <Bottle size="large" tone="berry" />
            <Bottle size="small" tone="green" label={"SA\nMEDOM"} />
          </div>
          <div className="hero-art__caption">
            <span>01</span>
            <p>{bindShortWords("Livadski med i ceđeni limun osnova su svakog našeg sirupa — voće i bilje daju mu karakter.")}</p>
          </div>
        </div>
      </div>
      <a className="scroll-cue" href="#put-pcele" aria-label="Skroluj dalje">
        <span>skroluj</span><i aria-hidden="true" />
      </a>
    </section>
  );
}
