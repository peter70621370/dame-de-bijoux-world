// Bandeau en haut du site et fenêtre à l'ouverture : types et règles partagés par le site et le back-office.

export const TYPES_ANNONCE = ["bandeau", "fenetre"] as const;
export type TypeAnnonce = (typeof TYPES_ANNONCE)[number];

export const estTypeAnnonce = (valeur: string): valeur is TypeAnnonce =>
  (TYPES_ANNONCE as readonly string[]).includes(valeur);

/** Couleurs proposées pour le bandeau ; `lien` : couleur du lien quand celle du texte ne suffit pas à le distinguer. */
export const TONS_BANDEAU = {
  nuit: { label: "Noir", classes: "bg-nuit text-ivoire", lien: "text-or-clair" },
  or: { label: "Doré", classes: "bg-or text-nuit", lien: "" },
  rubis: { label: "Rubis", classes: "bg-rubis text-white", lien: "" },
} as const;
export type TonBandeau = keyof typeof TONS_BANDEAU;

export type Lien = { label: string; url: string };

export type Bandeau = { texte: string; ton: TonBandeau; lien?: Lien };

export type Fenetre = {
  /** Change à chaque modification : un visiteur qui a fermé l'ancienne version voit la nouvelle. */
  version: string;
  titre: string;
  texte: string;
  image?: string;
  lien?: Lien;
};

/** Page proposée comme destination d'un lien, avec le texte de lien qui lui va. */
export type Destination = { label: string; url: string; texte: string };
export type GroupeDestinations = { groupe: string; destinations: Destination[] };

/** Fiche enregistrée, telle que la base la donne. */
type Fiche = {
  title: string;
  text: string;
  image: string | null;
  linkLabel: string;
  linkUrl: string;
  tone: string;
  updatedAt: Date;
};

/** Sans texte, le lien s'affiche « En savoir plus ». */
function lienDe(a: Fiche): Lien | undefined {
  return a.linkUrl ? { label: a.linkLabel || "En savoir plus", url: a.linkUrl } : undefined;
}

export function versBandeau(a: Fiche): Bandeau {
  return { texte: a.text, ton: a.tone in TONS_BANDEAU ? (a.tone as TonBandeau) : "nuit", lien: lienDe(a) };
}

export function versFenetre(a: Fiche): Fenetre {
  return {
    version: a.updatedAt.toISOString(),
    titre: a.title,
    texte: a.text,
    image: a.image ?? undefined,
    lien: lienDe(a),
  };
}

type Programme = { enabled: boolean; startsAt: Date | null; endsAt: Date | null };

export type EtatAnnonce = "desactivee" | "programmee" | "en-ligne" | "terminee";

export function etatAnnonce(a: Programme, now = new Date()): EtatAnnonce {
  if (!a.enabled) return "desactivee";
  if (a.endsAt && a.endsAt <= now) return "terminee";
  if (a.startsAt && a.startsAt > now) return "programmee";
  return "en-ligne";
}

/** Page du site (« /selection ») ou adresse complète en https (WhatsApp, TikTok…). */
export function estLienValide(url: string) {
  return /^\/(?!\/)\S*$/.test(url) || /^https:\/\/[^\s/]+\.[^\s]+$/.test(url);
}

/** Ouvert dans un nouvel onglet : adresse extérieure, ou /whatsapp qui renvoie vers la conversation de la boutique. */
export const estLienExterne = (url: string) => url.startsWith("https://") || url === "/whatsapp";
