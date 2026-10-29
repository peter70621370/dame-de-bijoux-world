import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer, CartToast } from "@/components/cart/CartDrawer";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingActions } from "@/components/FloatingActions";
import { IntroLogo } from "@/components/IntroLogo";
import { JsonLd } from "@/components/JsonLd";
import { site } from "@/lib/site";
import { minPrice, formatPrice } from "@/lib/products";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Bijoux & accessoires à petits prix à Lomé`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: [
    "bijoux Lomé",
    "bijoux Togo",
    "bijoux en gros Lomé",
    "grossiste bijoux Togo",
    "accessoires de beauté Lomé",
    "bracelet",
    "chaîne de taille",
    "Dame de Bijoux World",
  ],
  openGraph: {
    type: "website",
    locale: site.locale,
    siteName: site.name,
    url: "/",
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#150b11",
};

const localBusiness = {
  "@context": "https://schema.org",
  "@type": "JewelryStore",
  name: site.name,
  description: site.description,
  url: site.url,
  telephone: site.phone.replace(/\s/g, ""),
  image: `${site.url}/marque/logo-dame-de-bijoux.png`,
  logo: `${site.url}/marque/icone-512.png`,
  priceRange: `À partir de ${formatPrice(minPrice)}`,
  currenciesAccepted: "XOF",
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address,
    addressLocality: site.city,
    addressCountry: "TG",
  },
  sameAs: [site.tiktokUrl],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${jost.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">
        <IntroLogo />
        <a
          href="#contenu"
          className="sr-only z-[60] bg-nuit px-4 py-3 text-ivoire focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
        >
          Aller au contenu
        </a>
        <CartProvider>
          <Header />
          <main id="contenu" className="flex-1">
            {children}
          </main>
          <Footer />
          <FloatingActions />
          <CartToast />
          <CartDrawer />
        </CartProvider>
        <JsonLd data={localBusiness} />
        <Analytics />
      </body>
    </html>
  );
}
