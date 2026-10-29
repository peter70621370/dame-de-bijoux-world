"use server";

import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import { chiffresTelephone, compteTikTok, formaterTelephone } from "@/lib/boutique";
import { verifyAdmin } from "@/lib/dal";
import { BOUTIQUE_TAG } from "@/lib/data/boutique";
import { prisma } from "@/lib/prisma";
import { erreursParChamp, type EtatFormulaire } from "./formulaires";

const NUMERO_INCONNU = "Numéro non reconnu : 8 chiffres pour un numéro du Togo, sinon l’indicatif du pays devant.";

function numero() {
  return z.string().transform((saisie, ctx) => {
    const chiffres = chiffresTelephone(saisie);
    if (!chiffres) {
      ctx.addIssue({ code: "custom", message: saisie.trim() ? NUMERO_INCONNU : "Indiquez le numéro." });
      return z.NEVER;
    }
    return chiffres;
  });
}

function texte(min: number, max: number, vide: string) {
  return z.string().trim().min(min, vide).max(max, `${max} caractères au maximum.`);
}

const schema = z.object({
  phone: numero(),
  whatsapp: numero(),
  address: texte(3, 120, "Indiquez l’adresse."),
  city: texte(2, 60, "Indiquez la ville."),
  mapsUrl: z
    .string()
    .trim()
    .max(500, "Adresse trop longue.")
    .refine((url) => url === "" || /^https:\/\/[^\s/]+\.[^\s]+$/.test(url), "Collez une adresse complète commençant par https://, ou laissez vide."),
  hours: texte(3, 80, "Indiquez les jours et heures d’ouverture."),
  delivery: texte(10, 300, "Expliquez en une phrase le retrait et la livraison."),
  tiktok: z.string().transform((saisie, ctx) => {
    const compte = compteTikTok(saisie);
    if (!compte) {
      ctx.addIssue({ code: "custom", message: "Compte non reconnu : écrivez-le comme dans TikTok, par exemple @grossistebijoux1." });
      return z.NEVER;
    }
    return compte;
  }),
});

/** Enregistre les coordonnées : une seule fiche, créée au premier enregistrement. */
export async function enregistrerCoordonnees(_etat: EtatFormulaire, formData: FormData): Promise<EtatFormulaire> {
  await verifyAdmin();

  const champ = (cle: string) => String(formData.get(cle) ?? "");
  const resultat = schema.safeParse({
    phone: champ("phone"),
    whatsapp: champ("whatsapp"),
    address: champ("address"),
    city: champ("city"),
    mapsUrl: champ("mapsUrl"),
    hours: champ("hours"),
    delivery: champ("delivery"),
    tiktok: champ("tiktok"),
  });
  if (!resultat.success) {
    return { message: "Vérifiez les champs signalés en rouge.", erreurs: erreursParChamp(resultat.error.issues) };
  }

  const existante = await prisma.shopSettings.findUnique({ where: { id: "boutique" } });
  if (champ("version") !== (existante?.updatedAt.toISOString() ?? "")) {
    return {
      conflit: true,
      message: "Les coordonnées ont été modifiées ailleurs entre-temps. Rechargez la page pour repartir de leur dernière version.",
    };
  }

  const donnees = { ...resultat.data, phone: formaterTelephone(resultat.data.phone) };
  const reglages = await prisma.shopSettings.upsert({
    where: { id: "boutique" },
    create: { id: "boutique", ...donnees },
    update: donnees,
  });
  updateTag(BOUTIQUE_TAG);
  refresh();
  return { ok: "Enregistré : le site affiche les nouvelles coordonnées.", version: reglages.updatedAt.toISOString() };
}
