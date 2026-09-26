import { CartProvider } from "@/src/components/CartProvider";
import { Header } from "@/src/components/Header";
import { Hero } from "@/src/components/Hero";
import { BeeJourney } from "@/src/components/BeeJourney";
import { ProductCatalog } from "@/src/components/ProductCatalog";
import { StorySection } from "@/src/components/StorySection";
import { IngredientsSection } from "@/src/components/IngredientsSection";
import { HoneyHarvestSection } from "@/src/components/HoneyHarvestSection";
import { DeliverySection } from "@/src/components/DeliverySection";
import { ProofSection } from "@/src/components/ProofSection";
import { FinalCTA } from "@/src/components/FinalCTA";
import { Footer } from "@/src/components/Footer";
import { OrderDrawer } from "@/src/components/OrderDrawer";
import { MobileOrderBar } from "@/src/components/MobileOrderBar";
import { PageBee } from "@/src/components/PageBee";
import { CartToast } from "@/src/components/CartToast";
import { MotionOrchestrator } from "@/src/components/MotionOrchestrator";
import { brand, contact } from "@/src/data/siteContent";
import { getSiteUrl } from "@/src/lib/siteUrl";

// Regenerate at most daily so build-time values (the footer © year) never go stale.
export const revalidate = 86400;

export default function HomePage() {
  const siteUrl = getSiteUrl();
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: brand.name,
        brand: { "@type": "Brand", name: brand.productLine },
        description: "Porodično gazdinstvo iz Budisave kod Novog Sada: ručno pravljeni Immuno Craft sirupi sa livadskim medom i ceđenim limunom i Immuno Booster tegle.",
        foundingDate: "2022",
        foundingLocation: { "@type": "Place", name: brand.origin },
        founder: [
          { "@type": "Person", name: "Anita Toth" },
          { "@type": "Person", name: "Laslo Toth" },
        ],
        email: contact.email,
        telephone: contact.phoneHref,
        address: {
          "@type": "PostalAddress",
          addressLocality: brand.location,
          postalCode: brand.postalCode,
          addressRegion: brand.region,
          addressCountry: "RS",
        },
        sameAs: [contact.instagramUrl, contact.facebookUrl],
        url: siteUrl,
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: brand.name,
        inLanguage: "sr-Latn",
        publisher: { "@id": `${siteUrl}/#organization` },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <CartProvider>
        <a className="skip-link" href="#glavni-sadrzaj">Preskoči na glavni sadržaj</a>
        <Header />
        <MotionOrchestrator />
        <PageBee />
        <main id="glavni-sadrzaj">
          <Hero />
          <BeeJourney />
          <ProductCatalog />
          <StorySection />
          <IngredientsSection />
          <HoneyHarvestSection />
          <DeliverySection />
          <ProofSection />
          <FinalCTA />
        </main>
        <Footer />
        <OrderDrawer />
        <CartToast />
        <MobileOrderBar />
      </CartProvider>
    </>
  );
}
