import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { FaqList } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { Reveal } from "@/components/Reveal";
import { IconPhone, IconWhatsApp } from "@/components/icons";
import { getBoutique } from "@/lib/data/boutique";
import { getFaq } from "@/lib/data/faq";
import { greetingUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Questions fréquentes — commande, livraison, gros",
  description:
    "Comment commander, vente en gros, paiement, livraison et entretien des bijoux : toutes les réponses de Dame de Bijoux World.",
  alternates: { canonical: "/faq" },
};

export default async function FaqPage() {
  const [faq, boutique] = await Promise.all([getFaq(), getBoutique()]);
  return (
    <>
      <PageHeader crumbs={[{ label: "FAQ" }]} eyebrow="Aide" title="Questions fréquentes" />

      <section className="conteneur grid gap-14 py-16 md:py-24 lg:grid-cols-12">
        <nav aria-label="Rubriques" className="hidden lg:col-span-3 lg:block">
          <ul className="sticky top-28 space-y-3">
            {faq.map((g) => (
              <li key={g.title}>
                <a href={`#${slug(g.title)}`} className="eyebrow text-douce hover:text-or-fonce">
                  {g.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-16 lg:col-span-9">
          {faq.length === 0 && (
            <p className="titre text-3xl">Les réponses arrivent bientôt.</p>
          )}
          {faq.map((g) => (
            <Reveal key={g.title}>
              <h2 id={slug(g.title)} className="titre scroll-mt-28 text-4xl">
                {g.title}
              </h2>
              <div className="mt-6">
                <FaqList items={g.items} />
              </div>
            </Reveal>
          ))}

          <Reveal className="flex flex-col items-start gap-6 rounded-2xl bg-sable p-8 md:flex-row md:items-center md:justify-between md:p-10">
            <div>
              <p className="titre text-3xl">Une autre question ?</p>
              <p className="mt-2 text-sm text-douce">Notre équipe vous répond directement.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a href={greetingUrl(boutique.whatsapp)} target="_blank" rel="noopener noreferrer" className="bouton bouton-whatsapp">
                <IconWhatsApp width={18} height={18} /> WhatsApp
              </a>
              <a href={boutique.lienTelephone} className="bouton bouton-contour">
                <IconPhone width={16} height={16} /> Appeler
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.flatMap((g) =>
            g.items.map((i) => ({
              "@type": "Question",
              name: i.q,
              acceptedAnswer: { "@type": "Answer", text: i.a },
            })),
          ),
        }}
      />
    </>
  );
}

function slug(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
