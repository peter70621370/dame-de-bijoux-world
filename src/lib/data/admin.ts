import "server-only";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

// Lectures du back-office : toujours fraîches (pas de cache), et réservées aux comptes connectés.

export async function getTableauDeBord() {
  await verifySession();

  const [enLigne, masques, nouveautes, photos, categories, recents] = await Promise.all([
    prisma.product.count({ where: { published: true } }),
    prisma.product.count({ where: { published: false } }),
    prisma.product.count({ where: { published: true, isNew: true } }),
    prisma.productImage.count(),
    prisma.category.findMany({
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        label: true,
        onRequest: true,
        _count: { select: { products: { where: { published: true } } } },
      },
    }),
    prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        slug: true,
        name: true,
        price: true,
        published: true,
        isNew: true,
        updatedAt: true,
        category: { select: { label: true } },
        images: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
      },
    }),
  ]);

  return {
    enLigne,
    masques,
    nouveautes,
    photos,
    categories: categories.map((c) => ({
      id: c.id,
      label: c.label,
      onRequest: c.onRequest,
      articles: c._count.products,
    })),
    recents,
  };
}
