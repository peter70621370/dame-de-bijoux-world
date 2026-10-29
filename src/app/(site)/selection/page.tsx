import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { IconWhatsApp } from "@/components/icons";
import { getCatalogue } from "@/lib/data/catalogue";
import { whatsappUrl } from "@/lib/whatsapp";
import { site } from "@/lib/site";
import { Catalog } from "./Catalog";

export const metadata: Metadata = {
  title: "La Sélection — bracelets, chaînes de taille et accessoires",
  description:
    "Bracelets, chaînes de taille, bagues et accessoires de beauté à petits prix. Choisissez vos pièces et commandez sur WhatsApp, retrait à Lomé ou livraison.",
  alternates: { canonical: "/selection" },
};

export default async function SelectionPage() {
  const { products, categories } = await getCatalogue();
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Sélection" }]}
        eyebrow="Articles phares"
        title="La Sélection"
        intro="Choisissez vos pièces et leur coloris, ajoutez-les à votre commande, puis envoyez-la sur WhatsApp en un geste. Nous confirmons la disponibilité et la livraison dans la conversation."
      />

      <Suspense
        fallback={
          <div className="conteneur grid grid-cols-1 gap-6 py-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        }
      >
        <Catalog products={products} categories={categories} />
      </Suspense>

      <section id="sur-demande" className="border-t border-filet bg-sable/50">
        <div className="conteneur py-20 md:py-24">
          <Reveal>
            <p className="eyebrow text-or-fonce">Sur demande</p>
            <h2 className="titre mt-4 text-[clamp(2.4rem,5vw,4rem)]">Et bien d’autres pièces</h2>
            <p className="mt-5 max-w-xl leading-relaxed text-douce">
              Tous nos articles ne sont pas encore en ligne. Dites-nous ce que vous cherchez : nous vous
              envoyons photos, vidéos et prix sur WhatsApp.
            </p>
          </Reveal>
          <ul className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-filet bg-filet sm:grid-cols-2 lg:grid-cols-4">
            {categories
              .filter((c) => c.onRequest)
              .map((c, i) => (
                <Reveal as="li" key={c.id} delay={i * 80} className="flex flex-col bg-ivoire p-7">
                  <p className="font-serif text-2xl">{c.label}</p>
                  <p className="mt-2 text-sm leading-relaxed text-douce">{c.blurb}</p>
                  <a
                    href={whatsappUrl(
                      `Bonjour ${site.name}, je cherche des ${c.label.toLowerCase()}. Pouvez-vous m’envoyer les modèles disponibles et leurs prix ?`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lien-souligne mt-auto self-start pt-8 text-[#187a42]"
                  >
                    <IconWhatsApp width={16} height={16} /> Voir les modèles
                  </a>
                </Reveal>
              ))}
          </ul>
        </div>
      </section>
    </>
  );
}
