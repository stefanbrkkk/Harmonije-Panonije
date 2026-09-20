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

export default function HomePage() {
  const siteUrl = getSiteUrl();
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: brand.name,
        brand: brand.productLine,
        description: "Craft proizvodnja Immuno Craft sirupa, sokova i bustera iz Novog Sada.",
        foundingDate: "2022",
        founder: [
          { "@type": "Person", name: "Anita Toth" },
          { "@type": "Person", name: "Laslo Toth" },
        ],
        email: contact.email,
        telephone: contact.phoneHref,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Novi Sad",
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
