import { getBoutique } from "@/lib/data/boutique";
import { greetingUrl } from "@/lib/whatsapp";
import { IconArrow, IconPhone, IconPin, IconWhatsApp } from "./icons";
import { LogoEmbleme } from "./LogoEmbleme";
import { Reveal } from "./Reveal";

// Bloc contact de l'accueil et de la page Contact : WhatsApp en grand, puisque les
// commandes passent par là, le téléphone et la boutique à côté.
export async function ContactCards() {
  const boutique = await getBoutique();
  const cartes = [
    {
      icon: IconPhone,
      label: "Téléphone",
      title: boutique.phone,
      text: `${boutique.hours}.`,
      cta: "Appeler",
      href: boutique.lienTelephone,
    },
    {
      icon: IconPin,
      label: "La boutique",
      title: boutique.city,
      text: `${boutique.address}.`,
      cta: "Itinéraire",
      href: boutique.lienPlan,
      external: true,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12 lg:gap-5">
      <Reveal className="grain relative isolate flex flex-col overflow-hidden rounded-2xl bg-nuit p-6 text-ivoire md:col-span-2 md:p-12 lg:col-span-7 lg:row-span-2">
        <div className="halo absolute inset-0 -z-10" aria-hidden />
        <LogoEmbleme className="pointer-events-none absolute -right-12 -bottom-20 -z-10 h-60 w-auto text-or opacity-[0.07] md:h-80" />
        <p className="eyebrow flex items-center gap-4 text-or-clair">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#1f8f4e] text-white">
            <IconWhatsApp width={20} height={20} />
          </span>
          Commande · tarifs de gros · conseil
        </p>
        <h2 className="titre mt-8 max-w-md text-[clamp(2.3rem,4.4vw,3.6rem)]">Commandez en un message</h2>
        <p className="mt-5 max-w-md leading-relaxed text-ivoire/75">
          Le plus rapide pour commander ou demander un prix : notre équipe vous répond directement.
        </p>
        <div className="mt-auto pt-10">
          <a href={greetingUrl(boutique.whatsapp)} target="_blank" rel="noopener noreferrer" className="bouton bouton-whatsapp">
            <IconWhatsApp width={18} height={18} /> Écrire sur WhatsApp
          </a>
        </div>
      </Reveal>

      {cartes.map(({ icon: Icon, label, title, text, cta, href, external }, i) => (
        <Reveal key={label} delay={(i + 1) * 90} className="lg:col-span-5">
          <a
            href={href}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="group flex h-full flex-col rounded-2xl bg-sable/70 p-6 transition-colors duration-300 hover:bg-sable md:p-8"
          >
            <span className="eyebrow flex items-center gap-4 text-douce">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-ivoire text-or-fonce transition-colors duration-300 group-hover:bg-nuit group-hover:text-or-clair">
                <Icon width={20} height={20} />
              </span>
              {label}
            </span>
            <span className="prix mt-5 font-serif text-[1.75rem] leading-tight sm:text-[1.9rem]">{title}</span>
            <span className="mt-1 text-sm leading-relaxed text-douce">{text}</span>
            <span className="mt-auto inline-flex items-center gap-2 pt-5 text-[0.72rem] font-medium uppercase tracking-[0.2em]">
              {cta}
              <IconArrow width={14} height={14} className="transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </a>
        </Reveal>
      ))}
    </div>
  );
}
