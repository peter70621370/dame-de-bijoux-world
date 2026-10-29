import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { BandeauAnnonce } from "@/components/BandeauAnnonce";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer, CartToast } from "@/components/cart/CartDrawer";
import { FenetreAnnonce } from "@/components/FenetreAnnonce";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingActions } from "@/components/FloatingActions";
import { IntroLogo } from "@/components/IntroLogo";
import { JsonLd } from "@/components/JsonLd";
import { getActualitesPubliees } from "@/lib/data/actualites";
import { getAnnoncesEnCours } from "@/lib/data/annonces";
import { getCatalogue } from "@/lib/data/catalogue";
import { formatPrice, minPrice, toCartProduct } from "@/lib/products";
import { site } from "@/lib/site";

// Habillage du site public (en-tête, panier, pied de page…), partagé par les pages
// et par la page 404. Le back-office (/admin) a le sien.
export async function SiteChrome({ children }: { children: ReactNode }) {
  const [{ products }, { bandeau, fenetre }, actualites] = await Promise.all([
    getCatalogue(),
    getAnnoncesEnCours(),
    getActualitesPubliees(),
  ]);
  const prixMin = minPrice(products);

  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "JewelryStore",
    name: site.name,
    description: site.description,
    url: site.url,
    telephone: site.phone.replace(/\s/g, ""),
    image: `${site.url}/marque/logo-dame-de-bijoux.png`,
    logo: `${site.url}/marque/icone-512.png`,
    ...(prixMin !== null && { priceRange: `À partir de ${formatPrice(prixMin)}` }),
    currenciesAccepted: "XOF",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address,
      addressLocality: site.city,
      addressCountry: "TG",
    },
    sameAs: [site.tiktokUrl],
  };

  return (
    <>
      <IntroLogo />
      <a
        href="#contenu"
        className="sr-only z-[60] bg-nuit px-4 py-3 text-ivoire focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Aller au contenu
      </a>
      {bandeau && <BandeauAnnonce bandeau={bandeau} />}
      <CartProvider products={products.map(toCartProduct)}>
        <Header actualites={actualites.length > 0} />
        <main id="contenu" className="flex-1">
          {children}
        </main>
        <Footer />
        <FloatingActions />
        <CartToast />
        <CartDrawer />
      </CartProvider>
      {fenetre && <FenetreAnnonce fenetre={fenetre} />}
      <JsonLd data={localBusiness} />
      <Analytics />
    </>
  );
}
