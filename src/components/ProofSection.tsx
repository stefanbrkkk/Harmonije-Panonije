import { press, siteConfig, testimonials } from "@/src/data/siteContent";

export function ProofSection() {
  if (!siteConfig.showTestimonials && !siteConfig.showPress) return null;

  return (
    <section className="proof-section section-cream">
      <div className="shell proof-layout">
        <div className="proof-intro">
          <p className="eyebrow"><span />Utisci i priča</p>
          <h2>Mali brend. Stvarna priča.</h2>
          <p>Javni utisci kupaca izdvajaju ukus, dizajn i kvalitet, dok urednički tekstovi beleže priču o nastanku i razvoju brenda.</p>
        </div>

        {siteConfig.showTestimonials && (
          <div className="proof-quotes" aria-label="Sažeci javnih utisaka kupaca">
            {testimonials.map((item, index) => (
              <article key={item.quote}>
                <span aria-hidden="true">0{index + 1}</span>
                <p>{item.quote}</p>
                <footer>{item.detail}</footer>
              </article>
            ))}
          </div>
        )}

        {siteConfig.showPress && (
          <div className="proof-press">
            <p>Priča o Harmonijama Panonije pojavila se u uredničkim tekstovima:</p>
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
