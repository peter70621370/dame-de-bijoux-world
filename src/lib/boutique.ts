// Coordonnées et horaires de la boutique, modifiables dans le back-office (Coordonnées).
// Ce module ne lit pas la base : les composants du navigateur s'en servent aussi.

export type ReglagesBoutique = {
  /** Numéro affiché, par exemple « +228 92 28 63 63 ». */
  phone: string;
  /** Numéro WhatsApp, chiffres seuls avec l'indicatif. */
  whatsapp: string;
  address: string;
  city: string;
  /** Lien du plan ; vide : recherche Google Maps sur l'adresse. */
  mapsUrl: string;
  hours: string;
  delivery: string;
  /** Compte TikTok, sans « @ ». */
  tiktok: string;
};

/** Valeurs affichées tant que la boutique n'a rien enregistré. */
export const reglagesParDefaut: ReglagesBoutique = {
  phone: "+228 92 28 63 63",
  whatsapp: "22892286363",
  address: "Adewui, dans la VON de l’église baptiste",
  city: "Lomé",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Adewui%20%C3%A9glise%20baptiste%20Lom%C3%A9%20Togo",
  hours: "Du lundi au samedi",
  delivery:
    "Retrait en boutique à Adewui ou livraison : nous vous indiquons les options et les frais selon votre quartier.",
  tiktok: "grossistebijoux1",
};

export type Boutique = ReglagesBoutique & {
  /** Quartier : le début de l'adresse, avant la première virgule (« Adewui »). */
  quartier: string;
  lienTelephone: string;
  lienPlan: string;
  /** « @grossistebijoux1 » */
  compteTikTok: string;
  lienTikTok: string;
};

export function versBoutique(r: ReglagesBoutique): Boutique {
  return {
    ...r,
    quartier: r.address.split(",")[0].trim(),
    lienTelephone: `tel:+${chiffresTelephone(r.phone) ?? r.phone.replace(/\D/g, "")}`,
    lienPlan: r.mapsUrl || planParDefaut(r.address, r.city),
    compteTikTok: `@${r.tiktok}`,
    lienTikTok: `https://www.tiktok.com/@${r.tiktok}`,
  };
}

export function planParDefaut(address: string, city: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address} ${city} Togo`)}`;
}

/**
 * Numéro saisi → chiffres avec l'indicatif (« 22892286363 ») ; null s'il n'est pas reconnu.
 * Huit chiffres : numéro togolais, l'indicatif 228 est ajouté.
 */
export function chiffresTelephone(saisie: string) {
  const chiffres = saisie.replace(/\D/g, "").replace(/^00/, "");
  if (chiffres.length === 8) return `228${chiffres}`;
  return chiffres.length >= 10 && chiffres.length <= 15 ? chiffres : null;
}

/** « 22892286363 » → « +228 92 28 63 63 » ; les numéros étrangers gardent leurs chiffres groupés par l'indicatif seul. */
export function formaterTelephone(chiffres: string) {
  if (chiffres.length === 11 && chiffres.startsWith("228")) {
    return `+228 ${chiffres.slice(3).replace(/(\d{2})(?=\d)/g, "$1 ")}`;
  }
  return `+${chiffres}`;
}

/** « @compte », « compte » ou l'adresse du profil → « compte » ; null s'il n'est pas reconnu. */
export function compteTikTok(saisie: string) {
  const compte = saisie
    .trim()
    .replace(/^(https?:\/\/)?(www\.)?tiktok\.com\//i, "")
    .replace(/^@/, "")
    .replace(/[/?#].*$/, "");
  return /^[\w.]{2,24}$/.test(compte) ? compte : null;
}
