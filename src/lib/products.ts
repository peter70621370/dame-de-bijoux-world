// Types du catalogue et fonctions de mise en forme, utilisables côté navigateur.
// Les données viennent de la base : voir src/lib/data/catalogue.ts.

import { formatJour } from "./dates";

export type Category = {
  /** Identifiant dans les adresses : /selection?categorie=bracelets */
  id: string;
  label: string;
  /** Libellé court affiché en pastille sur les photos des cartes produit. */
  tag: string;
  blurb: string;
  /** Pas encore de fiches en ligne : la catégorie se commande sur demande. */
  onRequest?: boolean;
  /** Photo de la tuile sur l'accueil. */
  image?: string;
};

export type ProductImage = { src: string; alt: string };

export type ProductOption = {
  /** Nom affiché du choix : « Coloris », « Finition »… */
  name: string;
  /** Formes accordées pour les libellés : « 5 coloris », « Choisir le coloris ». */
  plural: string;
  choose: string;
  /** `image` : position de la photo à montrer pour ce choix. */
  values: { label: string; image?: number }[];
};

export type Product = {
  slug: string;
  name: string;
  /** Identifiant de la catégorie (voir Category.id). */
  category: string;
  categoryLabel: string;
  categoryTag: string;
  /** Prix payé par le client, promotion comprise. */
  price: number;
  /** Prix habituel, affiché barré pendant une promotion. */
  regularPrice?: number;
  /** Fin de la promotion (date ISO) ; absente si elle court jusqu'à ce qu'on la retire. */
  promoEndsAt?: string;
  isNew?: boolean;
  short: string;
  description: string;
  details: string[];
  images: ProductImage[];
  option?: ProductOption;
};

/** Ce dont le panier a besoin pour afficher une ligne : le reste de la fiche reste sur le serveur. */
export type CartProduct = Pick<Product, "slug" | "name" | "price" | "regularPrice" | "images" | "option">;

export function toCartProduct({ slug, name, price, regularPrice, images, option }: Product): CartProduct {
  return { slug, name, price, regularPrice, images, option };
}

/** Une promotion s'applique quand son prix est sous le prix habituel et que sa date de fin n'est pas passée. */
export function isPromoActive(
  p: { price: number; promoPrice: number | null; promoEndsAt: Date | null },
  now = new Date(),
) {
  return p.promoPrice !== null && p.promoPrice < p.price && (p.promoEndsAt === null || p.promoEndsAt > now);
}

/** Remise arrondie en pourcentage : 1 500 → 1 200 FCFA donne 20. */
export function discountPercent(price: number, regularPrice: number) {
  return Math.round((1 - price / regularPrice) * 100);
}

/** Dernier jour d'une promotion, à l'heure de Lomé : « 15 novembre ». */
export function formatPromoEnd(iso: string) {
  return formatJour(iso);
}

export function relatedProducts(product: Product, products: Product[], limit = 3) {
  const same = products.filter((p) => p.slug !== product.slug && p.category === product.category);
  const others = products.filter((p) => p.slug !== product.slug && p.category !== product.category);
  return [...same, ...others].slice(0, limit);
}

/** Prix le plus bas du catalogue, pour « Des bijoux dès … » ; null tant qu'aucun article n'est en ligne. */
export function minPrice(products: Product[]) {
  return products.length ? Math.min(...products.map((p) => p.price)) : null;
}

const fcfa = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

export function formatPrice(value: number) {
  // Espace insécable fine du format fr remplacée par une espace insécable simple
  // pour un rendu identique sur tous les navigateurs.
  return `${fcfa.format(value).replace(/ /g, " ")} FCFA`;
}
