"use server";

import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import { estLienValide, etatAnnonce, TONS_BANDEAU, TYPES_ANNONCE, type TonBandeau, type TypeAnnonce } from "@/lib/annonces";
import { verifySession } from "@/lib/dal";
import { ANNONCES_TAG } from "@/lib/data/annonces";
import { formatJour } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { estPhotoAutorisee, supprimerPhoto } from "@/lib/stockage";
import { debutDeJournee, erreursParChamp, finDeJournee, type EtatFormulaire } from "./formulaires";

const jour = z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/, "Date invalide.");

function schemaAnnonce(type: TypeAnnonce) {
  const bandeau = type === "bandeau";
  const maxTexte = bandeau ? 140 : 400;
  return z
    .object({
      enabled: z.boolean(),
      title: z.string().trim().max(80, "80 caractères au maximum."),
      text: z.string().trim().max(maxTexte, `${maxTexte} caractères au maximum.`),
      image: z.string().refine((url) => url === "" || estPhotoAutorisee(url, "annonces"), "Photo inconnue."),
      linkLabel: z.string().trim().max(40, "40 caractères au maximum."),
      linkUrl: z
        .string()
        .trim()
        .max(500, "Adresse trop longue.")
        .refine(
          (url) => url === "" || estLienValide(url),
          "Indiquez une page du site (« /selection ») ou une adresse complète commençant par https://.",
        ),
      // Couleur choisie parmi trois pastilles : une autre valeur ne peut venir que d'une page trafiquée.
      tone: z.string().transform((ton): TonBandeau => (ton in TONS_BANDEAU ? (ton as TonBandeau) : "nuit")),
      startsAt: jour,
      endsAt: jour,
    })
    .superRefine((a, ctx) => {
      const signaler = (path: string, message: string) => ctx.addIssue({ code: "custom", path: [path], message });
      if (a.enabled && bandeau && !a.text) signaler("text", "Écrivez le message, ou désactivez le bandeau.");
      if (a.enabled && !bandeau && !a.title) signaler("title", "Donnez un titre à la fenêtre, ou désactivez-la.");
      if (a.linkLabel && !a.linkUrl) signaler("linkUrl", "Indiquez l’adresse du lien, ou choisissez « Pas de lien ».");
      if (a.startsAt && a.endsAt && a.endsAt < a.startsAt) {
        signaler("endsAt", "Le dernier jour doit venir après le premier.");
      } else if (a.enabled && a.endsAt && finDeJournee(a.endsAt) < new Date()) {
        signaler("endsAt", "Cette date est déjà passée.");
      }
    });
}

/** Ce que voient maintenant les visiteurs, dit après l'enregistrement. */
function confirmation(type: TypeAnnonce, a: { enabled: boolean; startsAt: Date | null; endsAt: Date | null }) {
  const bandeau = type === "bandeau";
  const fin = a.endsAt ? `, jusqu’au ${formatJour(a.endsAt)} inclus` : "";
  const etat = etatAnnonce(a);
  if (etat === "en-ligne") {
    return bandeau
      ? `Enregistré : le bandeau est affiché sur le site${fin}.`
      : `Enregistré : la fenêtre s’ouvre sur le site, une fois par visiteur${fin}.`;
  }
  if (etat === "programmee" && a.startsAt) {
    const debut = formatJour(a.startsAt);
    return bandeau
      ? `Enregistré : le bandeau s’affichera à partir du ${debut}${fin}.`
      : `Enregistré : la fenêtre s’ouvrira à partir du ${debut}${fin}.`;
  }
  return bandeau ? "Enregistré : le bandeau est désactivé." : "Enregistré : la fenêtre est désactivée.";
}

/** Enregistre le bandeau ou la fenêtre : une seule fiche de chaque, créée au premier enregistrement. */
export async function enregistrerAnnonce(
  type: TypeAnnonce,
  _etat: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  await verifySession();
  if (!TYPES_ANNONCE.includes(type)) return { message: "Annonce inconnue." };

  const texte = (cle: string) => String(formData.get(cle) ?? "");
  const resultat = schemaAnnonce(type).safeParse({
    enabled: formData.get("enabled") === "on",
    title: texte("title"),
    text: texte("text"),
    image: texte("image"),
    linkLabel: texte("linkLabel"),
    linkUrl: texte("linkUrl"),
    tone: texte("tone"),
    startsAt: texte("startsAt"),
    endsAt: texte("endsAt"),
  });
  if (!resultat.success) {
    return { message: "Vérifiez les champs signalés en rouge.", erreurs: erreursParChamp(resultat.error.issues) };
  }
  const a = resultat.data;

  const existante = await prisma.announcement.findUnique({ where: { id: type } });
  // Changée depuis l'ouverture du formulaire (autre compte, interrupteur de la page des annonces) : on n'écrase rien.
  if (texte("version") !== (existante?.updatedAt.toISOString() ?? "")) {
    return {
      conflit: true,
      message: `${type === "bandeau" ? "Le bandeau a été modifié" : "La fenêtre a été modifiée"} ailleurs entre-temps. Rechargez la page pour repartir de sa dernière version.`,
    };
  }

  const donnees = {
    enabled: a.enabled,
    title: a.title,
    text: a.text,
    image: a.image || null,
    linkLabel: a.linkUrl ? a.linkLabel : "",
    linkUrl: a.linkUrl,
    tone: a.tone,
    startsAt: a.startsAt ? debutDeJournee(a.startsAt) : null,
    endsAt: a.endsAt ? finDeJournee(a.endsAt) : null,
  };
  const annonce = await prisma.announcement.upsert({
    where: { id: type },
    create: { id: type, ...donnees },
    update: donnees,
  });
  if (existante?.image && existante.image !== donnees.image) await supprimerPhoto(existante.image);
  updateTag(ANNONCES_TAG);
  refresh();
  return { ok: confirmation(type, annonce), version: annonce.updatedAt.toISOString() };
}

/** Active ou désactive le bandeau ou la fenêtre depuis la page des annonces, sans rien changer d'autre. */
export async function basculerAnnonce(type: TypeAnnonce, enabled: boolean): Promise<{ erreur?: string }> {
  await verifySession();
  if (!TYPES_ANNONCE.includes(type)) return { erreur: "Annonce inconnue." };

  const annonce = await prisma.announcement.findUnique({ where: { id: type } });
  if (!annonce || (enabled && !(type === "bandeau" ? annonce.text : annonce.title))) {
    return { erreur: "À rédiger d’abord." };
  }
  if (enabled && annonce.endsAt && annonce.endsAt <= new Date()) return { erreur: "Date de fin passée." };

  await prisma.announcement.update({ where: { id: type }, data: { enabled } });
  updateTag(ANNONCES_TAG);
  refresh();
  return {};
}
