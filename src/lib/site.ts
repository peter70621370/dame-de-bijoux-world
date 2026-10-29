// Coordonnées et réglages de la boutique : c'est le seul fichier à modifier
// pour changer un numéro, une adresse ou un lien.

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

  phone: "+228 92 28 63 63",
  phoneHref: "tel:+22892286363",
  whatsappNumber: "22892286363",

  address: "Adewui, dans la VON de l’église baptiste",
  city: "Lomé",
  country: "Togo",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Adewui%20%C3%A9glise%20baptiste%20Lom%C3%A9%20Togo",

  hours: "Du lundi au samedi",

  tiktokHandle: "@grossistebijoux1",
  tiktokUrl: "https://www.tiktok.com/@grossistebijoux1",

  // À confirmer avec la boutique avant mise en ligne : ces textes s'affichent
  // dans la FAQ et la fiche produit.
  payment: "Les modalités de paiement vous sont confirmées sur WhatsApp au moment de la commande.",
  delivery:
    "Retrait en boutique à Adewui ou livraison : nous vous indiquons les options et les frais selon votre quartier.",
} as const;

export const nav = [
  { href: "/selection", label: "Sélection" },
  { href: "/grossistes", label: "Vente en gros" },
  { href: "/maison", label: "La Maison" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
] as const;
