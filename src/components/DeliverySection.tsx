import { contact, delivery } from "@/src/data/siteContent";
import { bindShortWords } from "@/src/lib/typography";
import { DeliveryMapArt } from "./DeliveryMapArt";

const FACADE =
  "M-13 0V-16C-13-19-9.6-19.4-9.6-22.2C-9.6-23.8-11.6-24-11.6-25.6C-11.6-28-7.6-28.8-6.8-31.2C-6-34.6-3.4-36.2 0-36.2C3.4-36.2 6-34.6 6.8-31.2C7.6-28.8 11.6-28 11.6-25.6C11.6-24 9.6-23.8 9.6-22.2C9.6-19.4 13-19 13-16V0Z";

export function DeliverySection() {
  return (
    <section id="dostava" data-page-bee="hide" className="delivery-section section-paper">
      <div className="shell delivery-layout">
        <div className="delivery-copy">
          <p className="eyebrow"><span />Dostava i preuzimanje</p>
          <h2>{delivery.title}</h2>
          <p className="delivery-copy__lead">{bindShortWords(delivery.visibleCopy)}</p>
          <div className="delivery-actions">
            <a className="button button--dark" href={`mailto:${contact.email}?subject=${encodeURIComponent("Upit za dostavu — Harmonije Panonije")}`}>Pitaj za dostavu</a>
            <a className="text-link" href={`tel:${contact.phoneHref}`}>{contact.phoneDisplay}<span aria-hidden="true">↗</span></a>
          </div>
          <p className="delivery-copy__note">{bindShortWords(delivery.note)}</p>
        </div>

        <figure className="delivery-map atlas-plate">
          <div className="atlas-plate__head" aria-hidden="true">
            <span className="atlas-plate__title">Južna Bačka · Šajkaška</span>
            <span className="atlas-plate__coords">45°17′ s. g. š. · 20°00′ i. g. d.</span>
          </div>
          <div className="atlas-plate__frame">
            <div className="atlas-plate__canvas">
              <DeliveryMapArt />
            </div>
          </div>
          <figcaption>
            <span className="sr-only">Legenda mape:</span>
            <ul className="atlas-plate__legend">
              <li>
                <svg viewBox="0 0 26 18" aria-hidden="true" focusable="false">
                  <g transform="translate(13 17) scale(.44)">
                    <path d={FACADE} fill="#fbf7ec" stroke="#7a4f0e" strokeWidth="2" />
                    <path d="M-13-4.4H13V0H-13Z" fill="#d8a248" />
                  </g>
                </svg>
                <span><b>Budisava</b><em>naše gazdinstvo</em></span>
              </li>
              <li>
                <svg viewBox="0 0 26 18" aria-hidden="true" focusable="false">
                  <defs>
                    <pattern id="lgCity" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(22)">
                      <rect x=".5" y=".5" width="2" height="2" fill="rgba(15,40,33,.3)" />
                    </pattern>
                  </defs>
                  <path d="M5 11c-1-4 2-7 6-7 3 0 4 2 7 1 3 0 4 3 3 6-1 3-4 4-8 4-4 0-7-1-8-4Z" fill="url(#lgCity)" stroke="rgba(15,40,33,.6)" strokeWidth=".8" />
                </svg>
                <span><b>Novi Sad</b><em>gde smo počeli</em></span>
              </li>
              <li>
                <svg viewBox="0 0 26 18" aria-hidden="true" focusable="false">
                  <path d="M2 9H24" stroke="#7a4f0e" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="0 5" />
                </svg>
                <span><b>Dostava i preuzimanje</b><em>po dogovoru</em></span>
              </li>
            </ul>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
