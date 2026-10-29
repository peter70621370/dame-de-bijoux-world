import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { IconPhone, IconPin, IconTikTok, IconWhatsApp } from "@/components/icons";
import { site } from "@/lib/site";
import { greetingUrl } from "@/lib/whatsapp";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact — boutique à Adewui, Lomé",
  description: `Appelez le ${site.phone}, écrivez-nous sur WhatsApp ou passez à la boutique : ${site.address}, ${site.city}.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const cards = [
    {
      icon: IconWhatsApp,
      title: "WhatsApp",
      text: "Le plus rapide pour commander ou demander un prix.",
      cta: "Ouvrir la conversation",
      href: greetingUrl,
      external: true,
    },
    {
      icon: IconPhone,
      title: site.phone,
      text: `${site.hours}.`,
      cta: "Lancer l’appel",
      href: site.phoneHref,
    },
    {
      icon: IconPin,
      title: "La boutique",
      text: `${site.address}, ${site.city} — ${site.country}.`,
      cta: "Voir sur la carte",
      href: site.mapsUrl,
      external: true,
    },
  ];

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Contact" }]}
        eyebrow="Contact"
        title="Parlons bijoux."
        intro="Commande, tarifs de gros, conseil : notre équipe vous répond directement."
      />

      <section className="conteneur py-16 md:py-24">
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-filet bg-filet md:grid-cols-3">
          {cards.map(({ icon: Icon, title, text, cta, href, external }, i) => (
            <Reveal as="li" key={cta} delay={i * 90} className="bg-ivoire">
              <a
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="flex h-full flex-col p-8 transition-colors hover:bg-sable md:p-10"
              >
                <Icon width={26} height={26} className={i === 0 ? "text-[#1f8f4e]" : "text-or-fonce"} />
                <p className="prix mt-6 font-serif text-3xl">{title}</p>
                <p className="mt-2 text-sm leading-relaxed text-douce">{text}</p>
                <span className="lien-souligne mt-auto self-start pt-8">{cta}</span>
              </a>
            </Reveal>
          ))}
        </ul>
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
              href={site.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-flex items-center gap-3 text-sm hover:text-or-fonce"
            >
              <IconTikTok width={18} height={18} /> Nos nouveautés sur TikTok {site.tiktokHandle}
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
