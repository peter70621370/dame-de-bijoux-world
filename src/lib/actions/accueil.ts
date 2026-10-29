"use server";

import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import { verifyAdmin } from "@/lib/dal";
import { ACCUEIL_TAG } from "@/lib/data/accueil";
import { prisma } from "@/lib/prisma";
import { estPhotoAutorisee, supprimerPhoto } from "@/lib/stockage";
import { erreursParChamp, type EtatFormulaire } from "./formulaires";

function texte(min: number, max: number, vide: string) {
  return z.string().trim().min(min, vide).max(max, `${max} caractères au maximum.`);
}

const photo = z.string().refine((url) => url === "" || estPhotoAutorisee(url, "accueil"), "Photo inconnue.");

const schema = z
  .object({
    heroTitle: texte(5, 90, "Écrivez le titre."),
    heroText: texte(10, 300, "Écrivez le texte sous le titre."),
    heroImage: photo.refine((url) => url !== "", "Choisissez la grande photo."),
    heroImageAlt: z.string().trim().max(160, "160 caractères au maximum."),
    heroImage2: photo,
    heroImage2Alt: z.string().trim().max(160, "160 caractères au maximum."),
    featuredId: z.string(),
    wholesaleTitle: texte(5, 80, "Écrivez le titre du bloc."),
    wholesaleText: texte(10, 400, "Écrivez le texte du bloc."),
    wholesalePoints: z
      .string()
      .transform((lignes) =>
        lignes
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean),
      )
      .pipe(
        z
          .array(z.string().max(80, "Une ligne dépasse 80 caractères : raccourcissez-la."))
          .min(1, "Écrivez au moins un point.")
          .max(6, "6 points au maximum."),
      ),
  })
  .superRefine((a, ctx) => {
    const signaler = (path: string, message: string) => ctx.addIssue({ code: "custom", path: [path], message });
    if (!a.heroImageAlt) signaler("heroImageAlt", "Décrivez la photo en quelques mots.");
    if (a.heroImage2 && !a.heroImage2Alt) signaler("heroImage2Alt", "Décrivez la photo en quelques mots.");
  });

/** Enregistre les textes et photos de l'accueil : une seule fiche, créée au premier enregistrement. */
export async function enregistrerAccueil(_etat: EtatFormulaire, formData: FormData): Promise<EtatFormulaire> {
  await verifyAdmin();

  const champ = (cle: string) => String(formData.get(cle) ?? "");
  const resultat = schema.safeParse({
    heroTitle: champ("heroTitle"),
    heroText: champ("heroText"),
    heroImage: champ("heroImage"),
    heroImageAlt: champ("heroImageAlt"),
    heroImage2: champ("heroImage2"),
    heroImage2Alt: champ("heroImage2Alt"),
    featuredId: champ("featuredId"),
    wholesaleTitle: champ("wholesaleTitle"),
    wholesaleText: champ("wholesaleText"),
    wholesalePoints: champ("wholesalePoints"),
  });
  if (!resultat.success) {
    return { message: "Vérifiez les champs signalés en rouge.", erreurs: erreursParChamp(resultat.error.issues) };
  }
  const a = resultat.data;

  const [existante, vedette] = await Promise.all([
    prisma.homePage.findUnique({ where: { id: "accueil" } }),
    a.featuredId ? prisma.product.findUnique({ where: { id: a.featuredId }, select: { id: true } }) : null,
  ]);
  if (champ("version") !== (existante?.updatedAt.toISOString() ?? "")) {
    return {
      conflit: true,
      message: "L’accueil a été modifié ailleurs entre-temps. Rechargez la page pour repartir de sa dernière version.",
    };
  }
  if (a.featuredId && !vedette) {
    return {
      message: "Vérifiez les champs signalés en rouge.",
      erreurs: { featuredId: "Cet article n’existe plus : choisissez-en un autre." },
    };
  }

  const donnees = {
    ...a,
    heroImage2: a.heroImage2 || null,
    heroImage2Alt: a.heroImage2 ? a.heroImage2Alt : "",
    featuredId: a.featuredId || null,
  };
  const fiche = await prisma.homePage.upsert({
    where: { id: "accueil" },
    create: { id: "accueil", ...donnees },
    update: donnees,
  });
  // Photos envoyées puis remplacées : effacées (celles livrées avec le site ne sont jamais touchées).
  for (const ancienne of [existante?.heroImage, existante?.heroImage2]) {
    if (ancienne && ancienne !== donnees.heroImage && ancienne !== donnees.heroImage2) await supprimerPhoto(ancienne);
  }
  updateTag(ACCUEIL_TAG);
  refresh();
  return { ok: "Enregistré : l’accueil affiche les nouveaux textes et photos.", version: fiche.updatedAt.toISOString() };
}
