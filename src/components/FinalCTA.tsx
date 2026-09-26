import { contact } from "@/src/data/siteContent";

export function FinalCTA() {
  return (
    <section id="kontakt" data-page-bee="hide" className="final-cta section-honey">
      <div className="final-cta__bee" aria-hidden="true">
        <svg viewBox="0 0 120 90"><ellipse cx="58" cy="47" rx="22" ry="14"/><path d="M49 35l8 24M62 34l8 22"/><ellipse cx="43" cy="25" rx="18" ry="9" transform="rotate(-27 43 25)"/><ellipse cx="71" cy="25" rx="18" ry="9" transform="rotate(27 71 25)"/><path d="M34 45c-16-13-25-5-26 6M82 44c15-14 24-7 25 4"/></svg>
      </div>
      <div className="shell final-cta__inner">
        <p className="eyebrow"><span />Kontakt</p>
        <h2>Pronađite svoju <em>harmoniju</em> ukusa.</h2>
        <p>Javite se i proverite aktuelnu ponudu, cenu i najjednostavniji način dostave ili preuzimanja.</p>
        <div className="final-cta__actions">
          <a className="button button--dark" href="#proizvodi">Pogledaj proizvode</a>
          <a className="button button--ghost-dark" href={`mailto:${contact.email}`}>Pošalji mejl</a>
        </div>
        <div className="final-cta__contacts">
          <a href={`tel:${contact.phoneHref}`}><span>Telefon</span><strong>{contact.phoneDisplay}</strong></a>
          <a href={`mailto:${contact.email}`}><span>Mejl</span><strong>{contact.email.split("@")[0]}@<wbr />{contact.email.split("@")[1]}</strong></a>
          <a href={contact.instagramUrl} target="_blank" rel="noreferrer"><span>Instagram</span><strong>{contact.instagramHandle}</strong></a>
        </div>
      </div>
    </section>
  );
}
