import { site } from "./site";
import { formatPrice, type Product } from "./products";

// `numero` : chiffres seuls avec l'indicatif, `Boutique.whatsapp` (getBoutique() ou useBoutique()).
export function whatsappUrl(numero: string, message: string) {
  return `https://wa.me/${numero}?text=${encodeURIComponent(message)}`;
}

/** Message du bouton WhatsApp des cartes produit : article, prix et lien de la fiche. */
export function productEnquiryUrl(numero: string, product: Product) {
  // Tournures neutres : le choix peut être féminin (« finitions ») et le nom de l'article aussi (« Chaîne… »).
  const question = product.option
    ? `Pouvez-vous m’indiquer les ${product.option.plural} disponibles ?`
    : "L’article est-il disponible ?";
  const prix = product.regularPrice
    ? `${formatPrice(product.price)} en promotion au lieu de ${formatPrice(product.regularPrice)}`
    : formatPrice(product.price);
  return whatsappUrl(
    numero,
    [
      `Bonjour ${site.name} !`,
      `Je suis intéressé(e) par « ${product.name} » (${prix}). ${question}`,
      `${site.url}/selection/${product.slug}`,
    ].join("\n"),
  );
}

/** Message du bouton WhatsApp d'une actualité : son titre et son lien. */
export function newsEnquiryUrl(numero: string, actualite: { slug: string; titre: string }) {
  return whatsappUrl(
    numero,
    [
      `Bonjour ${site.name} !`,
      `Je vous écris au sujet de « ${actualite.titre} ».`,
      `${site.url}/actualites/${actualite.slug}`,
    ].join("\n"),
  );
}

export function greetingUrl(numero: string) {
  return whatsappUrl(numero, `Bonjour ${site.name}, je souhaite des informations.`);
}

export type OrderLine = {
  slug: string;
  name: string;
  variant?: string;
  optionName?: string;
  quantity: number;
  price: number;
  /** Présent quand `price` est un prix promotionnel : la boutique le voit dans le message. */
  regularPrice?: number;
};

export type OrderCustomer = {
  name: string;
  mode: "retrait" | "livraison";
  area?: string;
  note?: string;
};

/** `quartier` : lieu du retrait en boutique (`Boutique.quartier`). */
export function orderMessage(lines: OrderLine[], quartier: string, customer?: OrderCustomer) {
  const total = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  // Lien de la fiche sous chaque article (une fois par produit) : WhatsApp affiche
  // l'aperçu du premier lien, avec la photo du produit.
  const linked = new Set<string>();
  const rows = lines.flatMap((l) => {
    const variant = l.variant ? ` (${l.optionName ?? "Choix"} : ${l.variant})` : "";
    const promo = l.regularPrice ? " (prix promo)" : "";
    const row = `• ${l.quantity} × ${l.name}${variant} — ${formatPrice(l.price * l.quantity)}${promo}`;
    if (linked.has(l.slug)) return [row];
    linked.add(l.slug);
    return [row, `  ${site.url}/selection/${l.slug}`];
  });

  const parts = [
    `Bonjour ${site.name} !`,
    "",
    "Je souhaite commander :",
    ...rows,
    "",
    `Total indicatif : ${formatPrice(total)}`,
  ];

  if (customer) {
    parts.push("", `Nom : ${customer.name}`);
    parts.push(
      customer.mode === "livraison"
        ? `Livraison à : ${customer.area || "à préciser"}`
        : `Retrait en boutique (${quartier})`,
    );
    if (customer.note) parts.push(`Remarque : ${customer.note}`);
  }

  parts.push("", "Merci de me confirmer la disponibilité.");
  return parts.join("\n");
}
