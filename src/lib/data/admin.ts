import "server-only";
import { accueilParDefaut, VEDETTE_PAR_DEFAUT, type ContenuAccueil } from "@/lib/accueil";
import type { GroupeDestinations, TypeAnnonce } from "@/lib/annonces";
import { reglagesParDefaut, type ReglagesBoutique } from "@/lib/boutique";
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

/** Articles proposés dans les formulaires (promotion, actualité), rangés par catégorie dans l'ordre du site. */
export async function getChoixArticles() {
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

/** Bandeau et fenêtre tels qu'enregistrés ; null tant qu'ils n'ont jamais été rédigés. */
export async function getAnnonces() {
  await verifySession();
  const annonces = await prisma.announcement.findMany();
  return {
    bandeau: annonces.find((a) => a.id === "bandeau") ?? null,
    fenetre: annonces.find((a) => a.id === "fenetre") ?? null,
  };
}

export async function getAnnonce(id: TypeAnnonce) {
  await verifySession();
  return prisma.announcement.findUnique({ where: { id } });
}

/** Pages proposées comme destination d'un lien (bandeau, fenêtre), chacune avec un texte de lien qui lui va. */
export async function getDestinations(): Promise<GroupeDestinations[]> {
  await verifySession();

  const [categories, produits, actualites] = await Promise.all([
    prisma.category.findMany({
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      select: { slug: true, label: true },
    }),
    prisma.product.findMany({
      where: { published: true, images: { some: {} } },
      orderBy: [{ category: { position: "asc" } }, { category: { createdAt: "asc" } }, { position: "asc" }, { createdAt: "desc" }],
      select: { slug: true, name: true },
    }),
    prisma.post.findMany({
      where: { published: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      select: { slug: true, title: true },
    }),
  ]);

  const groupes: GroupeDestinations[] = [
    {
      groupe: "Pages",
      destinations: [
        { label: "Sélection", url: "/selection", texte: "Voir la sélection" },
        ...(actualites.length > 0 ? [{ label: "Actualités", url: "/actualites", texte: "Lire les actualités" }] : []),
        { label: "Vente en gros", url: "/grossistes", texte: "Tarifs de gros" },
        { label: "Contact", url: "/contact", texte: "Nous contacter" },
        { label: "WhatsApp de la boutique", url: "/whatsapp", texte: "Écrire sur WhatsApp" },
      ],
    },
    {
      groupe: "Catégories",
      destinations: categories.map((c) => ({ label: c.label, url: `/selection?categorie=${c.slug}`, texte: "Découvrir" })),
    },
    {
      groupe: "Articles",
      destinations: produits.map((p) => ({ label: p.name, url: `/selection/${p.slug}`, texte: "Voir l’article" })),
    },
    {
      groupe: "Actualités",
      destinations: actualites.map((a) => ({ label: a.title, url: `/actualites/${a.slug}`, texte: "Lire la suite" })),
    },
  ];
  return groupes.filter((g) => g.destinations.length > 0);
}

/** Actualités, de la plus récente à la plus ancienne, avec leurs articles comptés. */
export async function getActualites() {
  await verifySession();

  const posts = await prisma.post.findMany({
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      image: true,
      published: true,
      publishedAt: true,
      _count: { select: { products: true } },
    },
  });

  return posts.map(({ _count, image, ...p }) => ({ ...p, image: image ?? undefined, articles: _count.products }));
}

/** Actualité complète pour son formulaire, ou null si elle n'existe pas. */
export async function getActualite(id: string) {
  await verifySession();
  return prisma.post.findUnique({ where: { id }, include: { products: { select: { id: true } } } });
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

/** Coordonnées enregistrées, ou celles du site par défaut tant que la boutique n'a rien enregistré (`version` vide). */
export async function getCoordonnees() {
  await verifySession();
  const r = await prisma.shopSettings.findUnique({ where: { id: "boutique" } });
  const reglages: ReglagesBoutique = r
    ? {
        phone: r.phone,
        whatsapp: r.whatsapp,
        address: r.address,
        city: r.city,
        mapsUrl: r.mapsUrl,
        hours: r.hours,
        delivery: r.delivery,
        tiktok: r.tiktok,
      }
    : reglagesParDefaut;
  return { reglages, version: r?.updatedAt.toISOString() ?? "" };
}

const ORDRE_FAQ = [{ position: "asc" as const }, { createdAt: "asc" as const }];

/** Rubriques de la FAQ et leurs questions, dans l'ordre du site. */
export async function getFaqAdmin() {
  await verifySession();
  return prisma.faqSection.findMany({
    orderBy: ORDRE_FAQ,
    select: {
      id: true,
      title: true,
      questions: { orderBy: ORDRE_FAQ, select: { id: true, question: true, onHome: true } },
    },
  });
}

export async function getChoixRubriques() {
  await verifySession();
  return prisma.faqSection.findMany({ orderBy: ORDRE_FAQ, select: { id: true, title: true } });
}

/** Questions déjà sur l'accueil (hors `sauf`), pour prévenir avant d'en cocher une quatrième. */
export async function getQuestionsSurAccueil(sauf?: string) {
  await verifySession();
  return prisma.faqQuestion.findMany({
    where: { onHome: true, ...(sauf ? { NOT: { id: sauf } } : {}) },
    select: { question: true },
  });
}

export async function getQuestion(id: string) {
  await verifySession();
  return prisma.faqQuestion.findUnique({ where: { id } });
}

export async function getRubrique(id: string) {
  await verifySession();
  return prisma.faqSection.findUnique({
    where: { id },
    include: { _count: { select: { questions: true } } },
  });
}

/** Contenu de l'accueil enregistré, ou celui du site par défaut tant que la boutique n'a rien enregistré (`version` vide). */
export async function getAccueilAdmin() {
  await verifySession();
  const fiche = await prisma.homePage.findUnique({ where: { id: "accueil" } });
  if (fiche) {
    const contenu: ContenuAccueil = {
      heroTitle: fiche.heroTitle,
      heroText: fiche.heroText,
      heroImage: fiche.heroImage,
      heroImageAlt: fiche.heroImageAlt,
      heroImage2: fiche.heroImage2,
      heroImage2Alt: fiche.heroImage2Alt,
      wholesaleTitle: fiche.wholesaleTitle,
      wholesaleText: fiche.wholesaleText,
      wholesalePoints: fiche.wholesalePoints,
    };
    return { contenu, featuredId: fiche.featuredId, version: fiche.updatedAt.toISOString() };
  }
  const vedette = await prisma.product.findUnique({ where: { slug: VEDETTE_PAR_DEFAUT }, select: { id: true } });
  return { contenu: accueilParDefaut, featuredId: vedette?.id ?? null, version: "" };
}

/** Comptes du back-office, le compte connecté en premier. */
export async function getComptes() {
  const admin = await verifySession();
  const comptes = await prisma.adminUser.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, lastLoginAt: true, lockedUntil: true },
  });
  const now = new Date();
  return comptes
    .map((c) => ({ ...c, vous: c.id === admin.id, bloque: Boolean(c.lockedUntil && c.lockedUntil > now) }))
    .sort((a, b) => Number(b.vous) - Number(a.vous));
}
