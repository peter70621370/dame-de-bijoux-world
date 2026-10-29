import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { Category, Product } from "@/lib/products";

/** Tag à rafraîchir (updateTag) après chaque modification du catalogue dans le back-office. */
export const CATALOGUE_TAG = "catalogue";

/**
 * Catalogue public : catégories et articles en ligne.
 * Mis en cache et intégré aux pages au moment du rendu ; le back-office le rafraîchit
 * dès qu'une fiche change, les visiteurs n'interrogent donc pas la base à chaque page.
 */
export async function getCatalogue(): Promise<{ categories: Category[]; products: Product[] }> {
  "use cache";
  cacheTag(CATALOGUE_TAG);
  cacheLife("max");

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

  return {
    categories: categories.map((c) => ({
      id: c.slug,
      label: c.label,
      tag: c.tag,
      blurb: c.blurb,
      onRequest: c.onRequest,
      image: c.image ?? undefined,
    })),
    products: products.map((p) => ({
      slug: p.slug,
      name: p.name,
      category: p.category.slug,
      categoryLabel: p.category.label,
      categoryTag: p.category.tag,
      price: p.price,
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
    })),
  };
}

export async function getProduct(slug: string) {
  const { products } = await getCatalogue();
  return products.find((p) => p.slug === slug);
}
