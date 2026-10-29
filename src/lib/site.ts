// Identité du site. Les coordonnées de la boutique se modifient dans le back-office (src/lib/boutique.ts).

export const site = {
  name: "Dame de Bijoux World",
  shortName: "Dame de Bijoux",
  signature: "Gros… petit prix",
  description:
    "Bijoux et accessoires de beauté à petits prix, en gros et au détail. Commandez en un clic sur WhatsApp, retrait à Adewui (Lomé) ou livraison.",
  // Adresse publique (liens WhatsApp, référencement, aperçus de partage) : NEXT_PUBLIC_SITE_URL
  // si elle est définie, sinon l'adresse de production que Vercel donne au projet ; en local, localhost.
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
  locale: "fr_TG",

  country: "Togo",
  // Téléphone, WhatsApp, adresse, horaires et TikTok : src/lib/boutique.ts (modifiables dans le back-office).
} as const;

const nav = [
  { href: "/selection", label: "Sélection" },
  { href: "/grossistes", label: "Vente en gros" },
  { href: "/maison", label: "La Maison" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

/** Menu du site ; « Actualités » n'y figure qu'une fois la première actualité publiée. */
export function navigation(avecActualites: boolean) {
  return avecActualites ? [nav[0], { href: "/actualites", label: "Actualités" }, ...nav.slice(1)] : nav;
}
