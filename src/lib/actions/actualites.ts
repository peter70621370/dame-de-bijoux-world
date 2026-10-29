"use server";

import { refresh, updateTag } from "next/cache";
import { redirect, RedirectType } from "next/navigation";
import { z } from "zod";
import { verifySession } from "@/lib/dal";
import { ACTUALITES_TAG } from "@/lib/data/actualites";
import { aujourdhui, jourDe } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { slugify, slugLibre } from "@/lib/slug";
import { estPhotoAutorisee, supprimerPhoto } from "@/lib/stockage";
import { enJson, erreursParChamp, premierePhrase, type EtatFormulaire } from "./formulaires";

const schemaActualite = z
  .object({
    title: z.string().trim().min(2, "Donnez un titre à l’actualité.").max(120, "120 caractères au maximum."),
    excerpt: z.string().trim().max(200, "200 caractères au maximum."),
    body: z.string().trim().max(10_000, "10 000 caractères au maximum."),
    image: z.string().refine((url) => url === "" || estPhotoAutorisee(url, "actualites"), "Photo inconnue."),
    published: z.boolean(),
    publishedAt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Indiquez la date affichée.")
      .refine((jour) => jour <= aujourdhui(), "Cette date n’est pas encore arrivée."),
    articles: enJson(z.array(z.string()).max(24, "24 articles au maximum.")),
  })
  .superRefine((a, ctx) => {
    if (a.published && !a.body && a.articles.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["body"],
        message: "Écrivez le texte ou choisissez des articles, ou décochez « En ligne » pour la garder en brouillon.",
      });
    }
  });

/** Crée l'actualité (`id` nul) ou enregistre ses modifications. */
export async function enregistrerActualite(
  id: string | null,
  _etat: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  await verifySession();

  const texte = (cle: string) => String(formData.get(cle) ?? "");
  const resultat = schemaActualite.safeParse({
    title: texte("title"),
    excerpt: texte("excerpt"),
    body: texte("body"),
    image: texte("image"),
    published: formData.get("published") === "on",
    publishedAt: texte("publishedAt"),
    articles: texte("articles") || "[]",
  });
  if (!resultat.success) {
    return { message: "Vérifiez les champs signalés en rouge.", erreurs: erreursParChamp(resultat.error.issues) };
  }
  const a = resultat.data;

  const [existante, produits] = await Promise.all([
    id ? prisma.post.findUnique({ where: { id }, select: { id: true, image: true, publishedAt: true, updatedAt: true } }) : null,
    // Un article supprimé entre-temps est simplement laissé de côté.
    prisma.product.findMany({ where: { id: { in: a.articles } }, select: { id: true } }),
  ]);
  if (id && !existante) return { message: "Cette actualité n’existe plus : elle a peut-être été supprimée entre-temps." };
  // Fiche changée depuis l'ouverture du formulaire (autre compte, interrupteur de la liste) : on n'écrase rien.
  if (existante && texte("version") !== existante.updatedAt.toISOString()) {
    return {
      conflit: true,
      message: "Cette actualité a été modifiée ailleurs entre-temps. Rechargez la page pour repartir de sa dernière version.",
    };
  }

  // L'heure range les actualités d'un même jour : celle de l'enregistrement pour aujourd'hui, midi pour un autre jour.
  const publishedAt =
    existante && jourDe(existante.publishedAt) === a.publishedAt
      ? existante.publishedAt
      : a.publishedAt === aujourdhui()
        ? new Date()
        : new Date(`${a.publishedAt}T12:00:00.000Z`);

  const donnees = {
    title: a.title,
    excerpt: a.excerpt || premierePhrase(a.body) || a.title,
    body: a.body,
    image: a.image || null,
    published: a.published,
    publishedAt,
  };

  const post = existante
    ? await prisma.post.update({ where: { id: existante.id }, data: { ...donnees, products: { set: produits } } })
    : await prisma.post.create({
        data: {
          ...donnees,
          products: { connect: produits },
          slug: await slugLibre(slugify(a.title) || "actualite", async (slug) =>
            Boolean(await prisma.post.findUnique({ where: { slug }, select: { id: true } })),
          ),
        },
      });

  if (existante?.image && existante.image !== donnees.image) await supprimerPhoto(existante.image);
  updateTag(ACTUALITES_TAG);

  if (!existante) redirect(`/admin/actualites?ajout=${post.id}`, RedirectType.replace);
  refresh();
  return { ok: "Modifications enregistrées.", version: post.updatedAt.toISOString() };
}

export async function supprimerActualite(id: string) {
  await verifySession();

  const post = await prisma.post.findUnique({ where: { id }, select: { image: true } });
  if (post) {
    await prisma.post.delete({ where: { id } });
    if (post.image) await supprimerPhoto(post.image);
    updateTag(ACTUALITES_TAG);
  }
  redirect("/admin/actualites?suppression=1", RedirectType.replace);
}

/** Met l'actualité en ligne ou la repasse en brouillon, depuis la liste. */
export async function basculerActualite(id: string, published: boolean): Promise<{ erreur?: string }> {
  await verifySession();

  if (published) {
    const post = await prisma.post.findUnique({
      where: { id },
      select: { body: true, _count: { select: { products: true } } },
    });
    if (post && !post.body && post._count.products === 0) return { erreur: "Texte vide." };
  }
  await prisma.post.updateMany({ where: { id }, data: { published } });
  updateTag(ACTUALITES_TAG);
  refresh();
  return {};
}
