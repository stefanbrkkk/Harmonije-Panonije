import { brand, contact } from "@/src/data/siteContent";
import { BrandMark } from "./BrandMark";

export function Footer() {
  return (
    <footer className="site-footer section-dark">
      <div className="shell site-footer__top">
        <BrandMark />
        <p>Immuno Craft · Novi Sad · craft proizvodi sa medom, limunom, voćem i biljem.</p>
      </div>
      <div className="shell site-footer__bottom">
        <span>© {new Date().getFullYear()} {brand.name}</span>
        <div>
          <a href={contact.instagramUrl} target="_blank" rel="noreferrer">Instagram</a>
          <a href={contact.facebookUrl} target="_blank" rel="noreferrer">Facebook</a>
          <a href={`mailto:${contact.email}`}>Email</a>
        </div>
        <a href="#vrh">Nazad na vrh ↑</a>
      </div>
    </footer>
  );
}
