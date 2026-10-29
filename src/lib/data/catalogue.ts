import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isPromoActive, type Category, type Product } from "@/lib/products";

/** Tag à rafraîchir (updateTag) après chaque modification du catalogue dans le back-office. */
export const CATALOGUE_TAG = "catalogue";

const JOUR = 24 * 3600;

/**
 * Catalogue public : catégories et articles en ligne.
 * Mis en cache et intégré aux pages au moment du rendu ; le back-office le rafraîchit
 * dès qu'une fiche change, les visiteurs n'interrogent donc pas la base à chaque page.
 */
export async function getCatalogue(): Promise<{ categories: Category[]; products: Product[] }> {
  "use cache";
  cacheTag(CATALOGUE_TAG);

  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: [{ position: "asc" }, { createdAt: "asc" }] }),
    prisma.product.findMany({
      // Une fiche sans photo ne peut pas s'afficher : elle attend dans le back-office.
      where: { published: true, images: { some: {} } },
      orderBy: [{ position: "asc" }, { createdAt: "desc" }],
      include: {
        category: true,
        images: { orderBy: { position: "asc" } },
        variants: { orderBy: { position: "asc" } },
      },
    }),
  ]);

  // Une promotion qui se termine doit disparaître du site sans attendre la prochaine modification :
  // le cache est alors recalculé à la première fin de promotion à venir.
  const now = new Date();
  const fins = products.flatMap((p) => (isPromoActive(p, now) && p.promoEndsAt ? [p.promoEndsAt.getTime()] : []));
  if (fins.length > 0) {
    const secondes = Math.ceil((Math.min(...fins) - now.getTime()) / 1000);
    cacheLife({ stale: 300, revalidate: Math.min(30 * JOUR, Math.max(60, secondes)), expire: 365 * JOUR });
  } else {
    cacheLife("max");
  }

  return {
    categories: categories.map((c) => ({
      id: c.slug,
      label: c.label,
      tag: c.tag,
      blurb: c.blurb,
      onRequest: c.onRequest,
      image: c.image ?? undefined,
    })),
    products: products.map((p) => {
      const promoPrice = isPromoActive(p, now) ? p.promoPrice : null;
      return {
        slug: p.slug,
        name: p.name,
        category: p.category.slug,
        categoryLabel: p.category.label,
        categoryTag: p.category.tag,
        price: promoPrice ?? p.price,
        regularPrice: promoPrice === null ? undefined : p.price,
        promoEndsAt: promoPrice !== null && p.promoEndsAt ? p.promoEndsAt.toISOString() : undefined,
        isNew: p.isNew,
        short: p.short,
        description: p.description,
        details: p.details,
        images: p.images.map((i) => ({ src: i.url, alt: i.alt })),
        option:
          p.optionName && p.variants.length > 0
            ? {
                name: p.optionName,
                plural: p.optionPlural || p.optionName.toLowerCase(),
                choose: p.optionChoose || `Choisir : ${p.optionName.toLowerCase()}`,
                values: p.variants.map((v) => {
                  const image = p.images.findIndex((i) => i.id === v.imageId);
                  return { label: v.label, image: image >= 0 ? image : undefined };
                }),
              }
            : undefined,
      };
    }),
  };
}

export async function getProduct(slug: string) {
  const { products } = await getCatalogue();
  return products.find((p) => p.slug === slug);
}
