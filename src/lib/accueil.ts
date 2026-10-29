// Textes et photos de l'accueil, modifiables dans le back-office (Page d'accueil).
// Ce module ne lit pas la base : l'aperçu du back-office s'en sert aussi.

export type ContenuAccueil = {
  /** Un mot ou un groupe de mots entre astérisques (*belles*) s'affiche en italique. */
  heroTitle: string;
  heroText: string;
  heroImage: string;
  heroImageAlt: string;
  /** Petite photo en médaillon ; null : pas de médaillon. */
  heroImage2: string | null;
  heroImage2Alt: string;
  wholesaleTitle: string;
  wholesaleText: string;
  wholesalePoints: string[];
};

/** Valeurs affichées tant que la boutique n'a rien enregistré. */
export const accueilParDefaut: ContenuAccueil = {
  heroTitle: "L’éclat des *belles* choses, à petit prix.",
  heroText:
    "Bracelets, chaînes de taille, bagues et accessoires de beauté sélectionnés avec exigence. En gros comme au détail, commandés en un clic sur WhatsApp.",
  heroImage: "/produits/chaine-coquillages-etoiles.jpg",
  heroImageAlt: "Chaîne de taille dorée Coquillages & Étoiles portée sur une jupe en satin",
  heroImage2: "/produits/bracelet-jonc-vis-clou.jpg",
  heroImage2Alt: "Joncs dorés vis et clou",
  wholesaleTitle: "Achetez en gros, *au petit prix.*",
  wholesaleText:
    "Vous revendez des bijoux, préparez un mariage ou des cadeaux pour votre équipe ? Dame de Bijoux World est d’abord un grossiste : demandez nos tarifs de gros, nous vous répondons rapidement.",
  wholesalePoints: [
    "Tarifs dégressifs selon les quantités",
    "Arrivages réguliers, présentés en avant-première sur TikTok",
    "Conseil pour composer votre assortiment",
    "Réponse directe sur WhatsApp",
  ],
};

/** Article signalé sur la photo tant que la boutique n'en a pas choisi. */
export const VEDETTE_PAR_DEFAUT = "chaine-de-taille-coquillages-etoiles";

/**
 * « L’éclat des *belles* choses » → morceaux de texte, `accent` pour ceux entre astérisques.
 * Les deux derniers mots restent sur la même ligne (pas de mot seul en fin de titre).
 */
export function morceauxTitre(titre: string) {
  return titre
    .trim()
    .replace(/ (\S+)$/, "\u00a0$1")
    .split(/(\*[^*]+\*)/)
    .filter(Boolean)
    .map((morceau) =>
      /^\*[^*]+\*$/.test(morceau) ? { texte: morceau.slice(1, -1), accent: true } : { texte: morceau, accent: false },
    );
}
