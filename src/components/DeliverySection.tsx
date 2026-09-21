import { contact, delivery } from "@/src/data/siteContent";

export function DeliverySection() {
  return (
    <section id="dostava" className="delivery-section section-paper">
      <div className="shell delivery-layout">
        <div className="delivery-copy">
          <p className="eyebrow"><span />Dostava i preuzimanje</p>
          <h2>{delivery.title}</h2>
          <p className="delivery-copy__lead">{delivery.visibleCopy}</p>
          <div className="delivery-actions">
            <a className="button button--dark" href={`mailto:${contact.email}?subject=${encodeURIComponent("Upit za dostavu — Harmonije Panonije")}`}>Pitaj za dostavu</a>
            <a className="text-link" href={`tel:${contact.phoneHref}`}>{contact.phoneDisplay}<span aria-hidden="true">↗</span></a>
          </div>
          <p className="delivery-copy__note">Novi Sad je polazna tačka. Za adresu, preuzimanje i termin javite se direktno — dogovor ostaje jednostavan i ličan.</p>
        </div>

        <div className="delivery-map">
          <svg viewBox="0 0 720 470" role="img" aria-label="Apstraktna mapa Panonije sa rutom od Novog Sada">
            <path className="delivery-map__land" d="M56 73c101-49 170-12 242 2 77 15 140-22 211-3 75 20 115 82 111 151-4 73-58 104-86 164-31 67-88 55-155 38-73-18-131 9-204-14C93 385 37 329 33 249c-3-67-21-139 23-176Z" />
            <path className="delivery-map__river" d="M129-5c17 80 91 85 124 141 38 64-30 109 8 167 39 59 121 61 168 140" />
            <path className="delivery-map__route" d="M267 243c83-21 141-79 226-56 45 13 70 45 111 82" />
            <circle className="delivery-map__point delivery-map__point--origin" cx="267" cy="243" r="9" />
            <circle className="delivery-map__pulse" cx="267" cy="243" r="22" />
            <circle className="delivery-map__point" cx="604" cy="269" r="7" />
            <text x="280" y="228">Novi Sad</text>
            <text x="542" y="301">po dogovoru</text>
          </svg>
          <div className="delivery-map__legend">
            <span><i />Polazna tačka</span>
            <span><i />Dogovorena ruta</span>
          </div>
        </div>
      </div>
    </section>
  );
}
