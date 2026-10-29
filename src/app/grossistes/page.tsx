import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { IconCrown, IconSparkle, IconStore, IconTag } from "@/components/icons";
import { WholesaleForm } from "./WholesaleForm";

export const metadata: Metadata = {
  title: "Vente en gros — grossiste bijoux à Lomé",
  description:
    "Grossiste en bijoux et accessoires de beauté à Lomé : tarifs dégressifs pour revendeuses, boutiques et événements. Demandez vos prix de gros sur WhatsApp.",
  alternates: { canonical: "/grossistes" },
};

const profils = [
  { icon: IconTag, title: "Revendeuses", text: "Constituez votre stock à prix de gros et gardez une belle marge." },
  { icon: IconStore, title: "Boutiques & salons", text: "Complétez votre offre avec des bijoux et accessoires renouvelés." },
  { icon: IconCrown, title: "Mariages & événements", text: "Parures assorties pour le cortège, cadeaux d’invitées." },
  { icon: IconSparkle, title: "Cadeaux d’entreprise", text: "Des attentions élégantes pour vos équipes et vos clientes." },
];

export default function GrossistesPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Vente en gros" }]}
        eyebrow="Gros… petit prix"
        title={
          <>
            Le grossiste bijoux <em>de Lomé.</em>
          </>
        }
        intro="Dame de Bijoux World approvisionne revendeuses, boutiques et organisatrices d’événements. Dites-nous ce que vous cherchez et en quelle quantité : nous vous répondons sur WhatsApp avec nos tarifs."
      />

      <section className="conteneur py-20 md:py-24">
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-filet bg-filet sm:grid-cols-2 lg:grid-cols-4">
          {profils.map(({ icon: Icon, title, text }, i) => (
            <Reveal as="li" key={title} delay={i * 80} className="bg-ivoire p-8">
              <Icon width={26} height={26} className="text-or-fonce" />
              <p className="mt-6 font-serif text-2xl">{title}</p>
              <p className="mt-2 text-sm leading-relaxed text-douce">{text}</p>
            </Reveal>
          ))}
        </ul>
      </section>

      <section className="border-t border-filet bg-sable/50">
        <div className="conteneur grid gap-14 py-20 md:py-28 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow text-or-fonce">Comment ça marche</p>
            <h2 className="titre mt-4 text-[clamp(2.4rem,5vw,4rem)]">Votre demande en deux minutes</h2>
            <ol className="mt-10 space-y-8">
              {[
                ["Décrivez votre besoin", "Articles, quantités estimées, ville : quelques clics suffisent."],
                ["Recevez nos tarifs", "Nous vous envoyons prix de gros, photos et disponibilités sur WhatsApp."],
                ["Récupérez ou faites livrer", "Retrait à la boutique d’Adewui ou livraison selon votre localisation."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-5">
                  <span className="prix font-serif text-4xl leading-none text-or">0{i + 1}</span>
                  <span>
                    <span className="block font-serif text-2xl">{t}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-douce">{d}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Reveal>
          <Reveal delay={120} className="lg:col-span-6 lg:col-start-7">
            <WholesaleForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
