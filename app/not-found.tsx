import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/src/components/BrandMark";

export const metadata: Metadata = {
  title: "Stranica nije pronađena",
  robots: { index: false, follow: true },
};

/** Serbian 404 in the hero's palette; the default Next.js page was English. */
export default function NotFound() {
  return (
    <main className="not-found">
      <div className="not-found__inner">
        <Link href="/" className="not-found__brand" aria-label="Harmonije Panonije — početna">
          <BrandMark />
        </Link>
        <p className="eyebrow eyebrow--light"><span />Greška 404</p>
        <h1>Stranica nije pronađena.</h1>
        <p className="not-found__lead">Stranica koju tražite ne postoji ili je premeštena.</p>
        <Link href="/" className="button button--honey">Nazad na početnu</Link>
      </div>
    </main>
  );
}
