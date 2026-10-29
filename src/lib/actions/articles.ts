"use server";

import { refresh, updateTag } from "next/cache";
import { redirect, RedirectType } from "next/navigation";
import { z } from "zod";
import { verifySession } from "@/lib/dal";
import { CATALOGUE_TAG } from "@/lib/data/catalogue";
import { prisma } from "@/lib/prisma";
import { slugify, slugLibre } from "@/lib/slug";
import { estPhotoAutorisee, supprimerPhoto } from "@/lib/stockage";
import { enJson, erreursParChamp, finDeJournee, montant, montantFacultatif, type EtatFormulaire } from "./formulaires";

const schemaArticle = z
  .object({
    name: z.string().trim().min(2, "Donnez un nom à l’article.").max(120, "120 caractères au maximum."),
    categoryId: z.string().min(1, "Choisissez une catégorie."),
    price: montant("Indiquez le prix de vente en FCFA, en chiffres."),
    short: z.string().trim().max(200, "200 caractères au maximum."),
    description: z.string().trim().max(5000, "5 000 caractères au maximum."),
    details: z
      .string()
      .transform((texte) => texte.split("\n").map((ligne) => ligne.trim()).filter(Boolean))
      .pipe(z.array(z.string().max(150, "150 caractères au maximum par ligne.")).max(20, "20 lignes au maximum.")),
    published: z.boolean(),
    isNew: z.boolean(),
    photos: enJson(
      z
        .array(z.object({ url: z.string().refine((url) => estPhotoAutorisee(url, "produits"), "Photo inconnue.") }))
        .max(12, "12 photos au maximum."),
    ),
    optionName: z.string().trim().max(40, "40 caractères au maximum."),
    optionPlural: z.string().trim().max(40, "40 caractères au maximum."),
    variantes: enJson(
      z
        .array(
          z.object({
            label: z.string().trim().min(1, "Chaque valeur doit avoir un nom.").max(40, "40 caractères au maximum."),
            photo: z.string().nullable(),
          }),
        )
        .max(30, "30 valeurs au maximum."),
    ),
    promoPrice: montantFacultatif("Prix promo en FCFA, en chiffres."),
    promoEndsAt: z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/, "Date invalide."),
  })
  .superRefine((a, ctx) => {
    const signaler = (path: string, message: string) => ctx.addIssue({ code: "custom", path: [path], message });
    if (a.published && a.photos.length === 0)
      signaler("photos", "Ajoutez au moins une photo, ou décochez « En ligne » pour enregistrer l’article sans le montrer.");
    if (a.promoPrice !== null && a.promoPrice >= a.price)
      signaler("promoPrice", "Le prix promo doit être plus bas que le prix habituel.");
    if (a.promoPrice === null && a.promoEndsAt) signaler("promoPrice", "Indiquez le prix promo, ou videz la date.");
    if (a.promoPrice !== null && a.promoEndsAt && finDeJournee(a.promoEndsAt) < new Date())
      signaler("promoEndsAt", "Cette date est déjà passée.");
    if (a.variantes.length > 0 && !a.optionName)
      signaler("optionName", "Donnez un nom à ce choix, par exemple « Coloris ».");
    const libelles = a.variantes.map((v) => v.label.toLowerCase());
    if (new Set(libelles).size < libelles.length) signaler("variantes", "Deux valeurs portent le même nom.");
  });

/** « Coloris » → « coloris », « Finition » → « finitions » : pour « 5 coloris au choix ». */
function pluriel(nom: string) {
  const mot = nom.toLowerCase();
  return /[sxz]$/.test(mot) ? mot : `${mot}s`;
}

/** Première phrase de la description, pour les aperçus (Google, partages) quand le résumé est vide. */
function premierePhrase(texte: string) {
  const phrase = texte.split(/(?<=[.!?])\s/)[0] ?? "";
  return phrase.length > 160 ? `${phrase.slice(0, 157).trimEnd()}…` : phrase;
}

function legende(nom: string, position: number, variante?: string) {
  if (variante) return `${nom} – ${variante}`;
  return position === 0 ? nom : `${nom} – photo ${position + 1}`;
}

/** Crée l'article (`id` nul) ou enregistre ses modifications. */
export async function enregistrerArticle(
  id: string | null,
  _etat: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  await verifySession();

  const texte = (cle: string) => String(formData.get(cle) ?? "");
  const resultat = schemaArticle.safeParse({
    name: texte("name"),
    categoryId: texte("categoryId"),
    price: texte("price"),
    short: texte("short"),
    description: texte("description"),
    details: texte("details"),
    published: formData.get("published") === "on",
    isNew: formData.get("isNew") === "on",
    photos: texte("photos") || "[]",
    optionName: texte("optionName"),
    optionPlural: texte("optionPlural"),
    variantes: texte("variantes") || "[]",
    promoPrice: texte("promoPrice"),
    promoEndsAt: texte("promoEndsAt"),
  });
  if (!resultat.success) {
    return { message: "Vérifiez les champs signalés en rouge.", erreurs: erreursParChamp(resultat.error.issues) };
  }
  const a = resultat.data;

  const [categorie, existant] = await Promise.all([
    prisma.category.findUnique({ where: { id: a.categoryId }, select: { id: true } }),
    id ? prisma.product.findUnique({ where: { id }, include: { images: true } }) : null,
  ]);
  if (!categorie) return { message: "Cette catégorie n’existe plus.", erreurs: { categoryId: "Choisissez une autre catégorie." } };
  if (id && !existant) return { message: "Cet article n’existe plus : il a peut-être été supprimé entre-temps." };
  // Fiche changée depuis l'ouverture du formulaire (promotion, mise en ligne, autre compte) : on n'écrase rien.
  if (existant && texte("version") !== existant.updatedAt.toISOString()) {
    return {
      conflit: true,
      message: "Cet article a été modifié ailleurs entre-temps. Rechargez la page pour repartir de sa dernière version.",
    };
  }

  const avecChoix = a.optionName !== "" && a.variantes.length > 0;
  const donnees = {
    name: a.name,
    categoryId: a.categoryId,
    price: a.price,
    promoPrice: a.promoPrice,
    promoEndsAt: a.promoPrice !== null && a.promoEndsAt ? finDeJournee(a.promoEndsAt) : null,
    isNew: a.isNew,
    published: a.published,
    short: a.short || premierePhrase(a.description) || a.name,
    description: a.description,
    details: a.details,
    optionName: avecChoix ? a.optionName : null,
    optionPlural: avecChoix ? a.optionPlural || pluriel(a.optionName) : null,
    ...(!avecChoix && { optionChoose: null }),
  };

  const { produit, retirees } = await prisma.$transaction(async (tx) => {
    const produit = existant
      ? await tx.product.update({ where: { id: existant.id }, data: donnees })
      : await tx.product.create({
          data: {
            ...donnees,
            slug: await slugLibre(slugify(a.name) || "article", async (slug) =>
              Boolean(await tx.product.findUnique({ where: { slug }, select: { id: true } })),
            ),
          },
        });

    // Photos : celles déjà enregistrées gardent leur légende, les nouvelles en reçoivent une, toutes dans l'ordre choisi.
    const avant = new Map((existant?.images ?? []).map((image) => [image.url, image]));
    const idParUrl = new Map<string, string>();
    for (const [position, { url }] of a.photos.entries()) {
      const deja = avant.get(url);
      const variante = a.variantes.find((v) => v.photo === url)?.label;
      const image = deja
        ? await tx.productImage.update({ where: { id: deja.id }, data: { position } })
        : await tx.productImage.create({
            data: { productId: produit.id, url, alt: legende(a.name, position, variante), position },
          });
      idParUrl.set(url, image.id);
    }
    const retirees = [...avant.values()].filter((image) => !idParUrl.has(image.url));
    await tx.productImage.deleteMany({ where: { id: { in: retirees.map((image) => image.id) } } });

    await tx.productVariant.deleteMany({ where: { productId: produit.id } });
    if (avecChoix) {
      await tx.productVariant.createMany({
        data: a.variantes.map((v, position) => ({
          productId: produit.id,
          label: v.label,
          imageId: (v.photo && idParUrl.get(v.photo)) || null,
          position,
        })),
      });
    }
    return { produit, retirees };
  });

  await Promise.all(retirees.map((image) => supprimerPhoto(image.url)));
  updateTag(CATALOGUE_TAG);

  if (!existant) redirect(`/admin/articles?ajout=${produit.id}`, RedirectType.replace);
  refresh();
  return { ok: "Modifications enregistrées.", version: produit.updatedAt.toISOString() };
}

export async function supprimerArticle(id: string) {
  await verifySession();

  const produit = await prisma.product.findUnique({ where: { id }, include: { images: { select: { url: true } } } });
  if (produit) {
    await prisma.product.delete({ where: { id } });
    await Promise.all(produit.images.map((image) => supprimerPhoto(image.url)));
    updateTag(CATALOGUE_TAG);
  }
  redirect("/admin/articles?suppression=1", RedirectType.replace);
}

/** Met l'article en ligne ou le masque, depuis la liste (rupture de stock, retour en boutique…). */
export async function basculerEnLigne(id: string, published: boolean): Promise<{ erreur?: string }> {
  await verifySession();

  if (published && (await prisma.productImage.count({ where: { productId: id } })) === 0) {
    return { erreur: "Ajoutez d’abord une photo." };
  }
  await prisma.product.update({ where: { id }, data: { published } });
  updateTag(CATALOGUE_TAG);
  refresh();
  return {};
}
