import "server-only";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { isPromoActive } from "@/lib/products";

// Lectures du back-office : toujours fraîches (pas de cache), et réservées aux comptes connectés.

/** Catégories proposées dans les formulaires, dans l'ordre du site. */
export async function getChoixCategories() {
  await verifySession();
  return prisma.category.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    select: { id: true, label: true },
  });
}

export async function getArticles() {
  await verifySession();

  const produits = await prisma.product.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      price: true,
      promoPrice: true,
      promoEndsAt: true,
      published: true,
      isNew: true,
      category: { select: { id: true, label: true } },
      images: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
      _count: { select: { images: true } },
    },
  });

  const now = new Date();
  return produits.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    categoryId: p.category.id,
    categoryLabel: p.category.label,
    price: p.price,
    promoPrice: isPromoActive(p, now) ? p.promoPrice : null,
    published: p.published,
    isNew: p.isNew,
    photo: p.images[0]?.url,
    photos: p._count.images,
  }));
}

/** Catégories dans l'ordre du site, avec leurs articles comptés. */
export async function getCategories() {
  await verifySession();

  const categories = await prisma.category.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      slug: true,
      label: true,
      tag: true,
      onRequest: true,
      image: true,
      products: { select: { published: true, _count: { select: { images: true } } } },
    },
  });

  return categories.map(({ products, image, ...c }) => ({
    ...c,
    image: image ?? undefined,
    articles: products.length,
    enLigne: products.filter((p) => p.published && p._count.images > 0).length,
  }));
}

/** Catégorie pour son formulaire, ou null si elle n'existe pas. */
export async function getCategorie(id: string) {
  await verifySession();
  return prisma.category.findUnique({ where: { id }, include: { _count: { select: { products: true } } } });
}

/** Articles qui ont un prix promo : promotions en cours (la plus proche de sa fin d'abord) et terminées. */
export async function getPromotions() {
  await verifySession();

  const produits = await prisma.product.findMany({
    where: { promoPrice: { not: null } },
    select: {
      id: true,
      name: true,
      price: true,
      promoPrice: true,
      promoEndsAt: true,
      published: true,
      category: { select: { label: true } },
      images: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
    },
  });

  const now = new Date();
  const fin = (p: { promoEndsAt: Date | null }) => p.promoEndsAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
  const liste = produits.map((p) => ({
    id: p.id,
    name: p.name,
    categoryLabel: p.category.label,
    price: p.price,
    promoPrice: p.promoPrice ?? 0,
    promoEndsAt: p.promoEndsAt,
    visible: p.published && p.images.length > 0,
    photo: p.images[0]?.url,
    enCours: isPromoActive(p, now),
    /** Dernier jour passé ; sinon, hors « en cours », c'est le prix promo qui n'est pas plus bas que le prix. */
    terminee: p.promoEndsAt !== null && p.promoEndsAt <= now,
  }));

  return {
    enCours: liste.filter((p) => p.enCours).sort((a, b) => fin(a) - fin(b)),
    terminees: liste.filter((p) => !p.enCours).sort((a, b) => fin(b) - fin(a)),
  };
}

/** Articles proposés dans le formulaire de promotion, rangés par catégorie dans l'ordre du site. */
export async function getArticlesPourPromo() {
  await verifySession();

  const produits = await prisma.product.findMany({
    orderBy: [{ category: { position: "asc" } }, { category: { createdAt: "asc" } }, { position: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      price: true,
      promoPrice: true,
      promoEndsAt: true,
      published: true,
      category: { select: { label: true } },
      images: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
    },
  });

  const now = new Date();
  return produits.map((p) => {
    const enPromo = isPromoActive(p, now);
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: p.price,
      categoryLabel: p.category.label,
      visible: p.published && p.images.length > 0,
      photo: p.images[0]?.url,
      /** Promotion en cours (prix et dernier jour AAAA-MM-JJ), sinon null et "". */
      promoPrice: enPromo ? p.promoPrice : null,
      promoEndsAt: enPromo && p.promoEndsAt ? p.promoEndsAt.toISOString().slice(0, 10) : "",
    };
  });
}

/** Article complet pour son formulaire, ou null s'il n'existe pas. */
export async function getArticle(id: string) {
  await verifySession();
  return prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { position: "asc" } },
    },
  });
}

export async function getTableauDeBord() {
  await verifySession();

  const [enLigne, masques, nouveautes, avecPromo, categories, recents] = await Promise.all([
    prisma.product.count({ where: { published: true } }),
    prisma.product.count({ where: { published: false } }),
    prisma.product.count({ where: { published: true, isNew: true } }),
    prisma.product.findMany({
      where: { published: true, promoPrice: { not: null } },
      select: { price: true, promoPrice: true, promoEndsAt: true },
    }),
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
        promoPrice: true,
        promoEndsAt: true,
        published: true,
        isNew: true,
        updatedAt: true,
        category: { select: { label: true } },
        images: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
      },
    }),
  ]);

  const now = new Date();
  return {
    enLigne,
    masques,
    nouveautes,
    promotions: avecPromo.filter((p) => isPromoActive(p, now)).length,
    categories: categories.map((c) => ({
      id: c.id,
      label: c.label,
      onRequest: c.onRequest,
      articles: c._count.products,
    })),
    recents: recents.map((p) => ({ ...p, enPromo: isPromoActive(p, now) })),
  };
}
