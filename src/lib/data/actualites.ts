import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";

/** Tag à rafraîchir (updateTag) après chaque modification d'une actualité. */
export const ACTUALITES_TAG = "actualites";

export type Actualite = {
  slug: string;
  titre: string;
  resume: string;
  texte: string;
  image?: string;
  /** Date affichée, en ISO. */
  date: string;
  /** Articles présentés (adresses) ; ceux qui ne sont plus en ligne sont écartés à l'affichage. */
  articles: string[];
};

/** Actualités en ligne, de la plus récente à la plus ancienne. */
export async function getActualitesPubliees(): Promise<Actualite[]> {
  "use cache";
  cacheTag(ACTUALITES_TAG);
  cacheLife("max");

  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    include: { products: { select: { slug: true } } },
  });

  return posts.map((p) => ({
    slug: p.slug,
    titre: p.title,
    resume: p.excerpt,
    texte: p.body,
    image: p.image ?? undefined,
    date: p.publishedAt.toISOString(),
    articles: p.products.map((produit) => produit.slug),
  }));
}

export async function getActualitePubliee(slug: string) {
  const actualites = await getActualitesPubliees();
  return actualites.find((a) => a.slug === slug);
}
