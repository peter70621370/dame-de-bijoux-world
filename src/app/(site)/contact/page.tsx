import type { Metadata } from "next";
import { ContactCards } from "@/components/ContactCards";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { IconTikTok } from "@/components/icons";
import { getBoutique } from "@/lib/data/boutique";
import { ContactForm } from "./ContactForm";

export async function generateMetadata(): Promise<Metadata> {
  const boutique = await getBoutique();
  return {
    title: `Contact — boutique à ${boutique.quartier}, ${boutique.city}`,
    description: `Appelez le ${boutique.phone}, écrivez-nous sur WhatsApp ou passez à la boutique : ${boutique.address}, ${boutique.city}.`,
    alternates: { canonical: "/contact" },
  };
}

export default async function ContactPage() {
  const boutique = await getBoutique();
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Contact" }]}
        eyebrow="Contact"
        title="Parlons bijoux."
        intro="Commande, tarifs de gros, conseil : notre équipe vous répond directement."
      />

      <section className="conteneur py-16 md:py-24">
        <ContactCards />
      </section>

      <section className="border-t border-filet bg-sable/50">
        <div className="conteneur grid gap-14 py-20 md:py-28 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow text-or-fonce">Écrivez-nous</p>
            <h2 className="titre mt-4 text-[clamp(2.4rem,5vw,4rem)]">Un message, une réponse rapide</h2>
            <p className="mt-6 max-w-md leading-relaxed text-douce">
              Remplissez ces quelques lignes : votre message s’ouvre dans WhatsApp, prêt à être envoyé.
            </p>
            <a
              href={boutique.lienTikTok}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-flex items-center gap-3 text-sm hover:text-or-fonce"
            >
              <IconTikTok width={18} height={18} /> Nos nouveautés sur TikTok {boutique.compteTikTok}
            </a>
          </Reveal>
          <Reveal delay={120} className="lg:col-span-6 lg:col-start-7">
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
