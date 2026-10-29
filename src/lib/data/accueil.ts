import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { accueilParDefaut, VEDETTE_PAR_DEFAUT, type ContenuAccueil } from "@/lib/accueil";
import { CATALOGUE_TAG } from "@/lib/data/catalogue";
import { prisma } from "@/lib/prisma";

/** Tag à rafraîchir (updateTag) après chaque modification de l'accueil. */
export const ACCUEIL_TAG = "accueil";

/** `vedette` : adresse (slug) de l'article signalé sur la photo ; il ne s'affiche que s'il est en ligne. */
export async function getAccueil(): Promise<ContenuAccueil & { vedette: string | null }> {
  "use cache";
  // L'article signalé peut changer d'adresse quand on le renomme : le catalogue rafraîchit aussi l'accueil.
  cacheTag(ACCUEIL_TAG, CATALOGUE_TAG);
  cacheLife("max");

  const fiche = await prisma.homePage.findUnique({
    where: { id: "accueil" },
    include: { featured: { select: { slug: true } } },
  });
  if (!fiche) return { ...accueilParDefaut, vedette: VEDETTE_PAR_DEFAUT };

  return {
    heroTitle: fiche.heroTitle,
    heroText: fiche.heroText,
    heroImage: fiche.heroImage,
    heroImageAlt: fiche.heroImageAlt,
    heroImage2: fiche.heroImage2,
    heroImage2Alt: fiche.heroImage2Alt,
    wholesaleTitle: fiche.wholesaleTitle,
    wholesaleText: fiche.wholesaleText,
    wholesalePoints: fiche.wholesalePoints,
    vedette: fiche.featured?.slug ?? null,
  };
}
