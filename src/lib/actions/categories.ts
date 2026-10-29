"use server";

import { refresh, updateTag } from "next/cache";
import { redirect, RedirectType } from "next/navigation";
import { z } from "zod";
import { verifySession } from "@/lib/dal";
import { CATALOGUE_TAG } from "@/lib/data/catalogue";
import { prisma } from "@/lib/prisma";
import { slugify, slugLibre } from "@/lib/slug";
import { estPhotoAutorisee, supprimerPhoto } from "@/lib/stockage";
import { erreursParChamp, type EtatFormulaire } from "./formulaires";

const schemaCategorie = z.object({
  label: z.string().trim().min(2, "Donnez un nom à la catégorie.").max(60, "60 caractères au maximum."),
  tag: z.string().trim().min(1, "Indiquez le mot affiché sur les photos.").max(24, "24 caractères au maximum."),
  blurb: z.string().trim().max(200, "200 caractères au maximum."),
  onRequest: z.boolean(),
  image: z.string().refine((url) => url === "" || estPhotoAutorisee(url, "categories"), "Photo inconnue."),
});

/** Crée la catégorie (`id` nul) ou enregistre ses modifications. */
export async function enregistrerCategorie(
  id: string | null,
  _etat: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  await verifySession();

  const texte = (cle: string) => String(formData.get(cle) ?? "");
  const resultat = schemaCategorie.safeParse({
    label: texte("label"),
    tag: texte("tag"),
    blurb: texte("blurb"),
    onRequest: formData.get("onRequest") === "on",
    image: texte("image"),
  });
  if (!resultat.success) {
    return { message: "Vérifiez les champs signalés en rouge.", erreurs: erreursParChamp(resultat.error.issues) };
  }
  const c = resultat.data;

  const [existante, homonyme] = await Promise.all([
    id ? prisma.category.findUnique({ where: { id }, select: { id: true, image: true } }) : null,
    prisma.category.findFirst({
      where: { label: { equals: c.label, mode: "insensitive" }, ...(id ? { NOT: { id } } : {}) },
      select: { id: true },
    }),
  ]);
  if (id && !existante) return { message: "Cette catégorie n’existe plus : elle a peut-être été supprimée entre-temps." };
  if (homonyme) return { message: "Vérifiez les champs signalés en rouge.", erreurs: { label: "Une autre catégorie porte déjà ce nom." } };

  const donnees = { label: c.label, tag: c.tag, blurb: c.blurb, onRequest: c.onRequest, image: c.image || null };

  if (existante) {
    await prisma.category.update({ where: { id: existante.id }, data: donnees });
    if (existante.image && existante.image !== donnees.image) await supprimerPhoto(existante.image);
    updateTag(CATALOGUE_TAG);
    refresh();
    return { ok: "Modifications enregistrées." };
  }

  // Une nouvelle catégorie se range à la fin ; son identifiant d'adresse ne changera plus.
  const { _max } = await prisma.category.aggregate({ _max: { position: true } });
  const creee = await prisma.category.create({
    data: {
      ...donnees,
      position: (_max.position ?? -1) + 1,
      slug: await slugLibre(slugify(c.label) || "categorie", async (slug) =>
        Boolean(await prisma.category.findUnique({ where: { slug }, select: { id: true } })),
      ),
    },
  });
  updateTag(CATALOGUE_TAG);
  redirect(`/admin/categories?ajout=${creee.id}`, RedirectType.replace);
}

/** Supprime une catégorie vide ; une catégorie qui contient encore des articles est conservée. */
export async function supprimerCategorie(id: string) {
  await verifySession();

  const categorie = await prisma.category.findUnique({
    where: { id },
    select: { image: true, _count: { select: { products: true } } },
  });
  if (!categorie) redirect("/admin/categories", RedirectType.replace);
  // La page de la catégorie explique alors qu'il faut d'abord déplacer ou supprimer ses articles.
  if (categorie._count.products > 0) redirect(`/admin/categories/${id}`, RedirectType.replace);

  await prisma.category.delete({ where: { id } });
  if (categorie.image) await supprimerPhoto(categorie.image);
  updateTag(CATALOGUE_TAG);
  redirect("/admin/categories?suppression=1", RedirectType.replace);
}

/** Monte (-1) ou descend (1) la catégorie d'un rang : c'est l'ordre de l'accueil et du catalogue. */
export async function deplacerCategorie(id: string, sens: -1 | 1) {
  await verifySession();
  if (sens !== -1 && sens !== 1) return;

  const ordre = await prisma.category.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    select: { id: true },
  });
  const i = ordre.findIndex((c) => c.id === id);
  if (i < 0 || !ordre[i + sens]) return;
  [ordre[i], ordre[i + sens]] = [ordre[i + sens], ordre[i]];

  // Renumérote tout : les catégories importées au départ peuvent partager le même rang.
  await prisma.$transaction(
    ordre.map((c, position) => prisma.category.update({ where: { id: c.id }, data: { position } })),
  );
  updateTag(CATALOGUE_TAG);
  refresh();
}
