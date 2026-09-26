import { press, siteConfig, testimonials } from "@/src/data/siteContent";
import { bindShortWords } from "@/src/lib/typography";

export function ProofSection() {
  if (!siteConfig.showTestimonials && !siteConfig.showPress) return null;

  return (
    <section className="proof-section section-cream">
      <div className="shell proof-layout">
        <div className="proof-intro">
          <p className="eyebrow"><span />Utisci i priča</p>
          <h2>Mali brend. Stvarna priča.</h2>
          <p>{bindShortWords("Ukratko šta kupci javno ističu, uz uredničke tekstove o tome kako je brend nastao i rastao.")}</p>
        </div>

        {siteConfig.showTestimonials && (
          <div className="proof-quotes" role="group" aria-label="Sažeci javnih utisaka kupaca">
            {testimonials.map((item, index) => (
              <article key={item.quote}>
                <span aria-hidden="true">0{index + 1}</span>
                <p>{bindShortWords(item.quote)}</p>
                <footer>{item.detail}</footer>
              </article>
            ))}
          </div>
        )}

        {siteConfig.showPress && (
          <div className="proof-press">
            <p>{bindShortWords("Priča o Harmonijama Panonije pojavila se u uredničkim tekstovima:")}</p>
            <div>
              {press.map((item) => (
                <a href={item.href} target="_blank" rel="noreferrer" key={item.label}>{item.label}<span aria-hidden="true">↗</span></a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
