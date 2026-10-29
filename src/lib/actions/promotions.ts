"use server";

import { refresh, updateTag } from "next/cache";
import { redirect, RedirectType } from "next/navigation";
import { z } from "zod";
import { verifySession } from "@/lib/dal";
import { CATALOGUE_TAG } from "@/lib/data/catalogue";
import { prisma } from "@/lib/prisma";
import { formatPrice, isPromoActive } from "@/lib/products";
import { erreursParChamp, finDeJournee, montant, type EtatFormulaire } from "./formulaires";

const schemaPromotion = z.object({
  productId: z.string().min(1, "Choisissez un article."),
  promoPrice: montant("Indiquez le prix promo en FCFA, en chiffres."),
  promoEndsAt: z
    .string()
    .regex(/^(\d{4}-\d{2}-\d{2})?$/, "Date invalide.")
    .refine((jour) => !jour || finDeJournee(jour) >= new Date(), "Cette date est déjà passée."),
});

/** Lance la promotion d'un article, ou modifie celle en cours. */
export async function enregistrerPromotion(_etat: EtatFormulaire, formData: FormData): Promise<EtatFormulaire> {
  await verifySession();

  const texte = (cle: string) => String(formData.get(cle) ?? "");
  const resultat = schemaPromotion.safeParse({
    productId: texte("productId"),
    promoPrice: texte("promoPrice"),
    promoEndsAt: texte("promoEndsAt"),
  });
  if (!resultat.success) {
    return { message: "Vérifiez les champs signalés en rouge.", erreurs: erreursParChamp(resultat.error.issues) };
  }
  const p = resultat.data;

  const produit = await prisma.product.findUnique({
    where: { id: p.productId },
    select: { price: true, promoPrice: true, promoEndsAt: true },
  });
  if (!produit) return { message: "Cet article n’existe plus.", erreurs: { productId: "Choisissez un autre article." } };
  // Nouvelle promotion sur un article qui en a reçu une entre-temps (autre compte, autre onglet) : on ne l'écrase pas.
  if (formData.get("nouvelle") === "1" && isPromoActive(produit)) {
    return {
      message: "Vérifiez les champs signalés en rouge.",
      erreurs: { productId: "Cet article est déjà en promotion : modifiez-la depuis la liste des promotions." },
    };
  }
  if (p.promoPrice >= produit.price) {
    return {
      message: "Vérifiez les champs signalés en rouge.",
      erreurs: { promoPrice: `Le prix promo doit être plus bas que le prix habituel (${formatPrice(produit.price)}).` },
    };
  }

  await prisma.product.update({
    where: { id: p.productId },
    data: { promoPrice: p.promoPrice, promoEndsAt: p.promoEndsAt ? finDeJournee(p.promoEndsAt) : null },
  });
  updateTag(CATALOGUE_TAG);
  redirect(`/admin/promotions?promo=${p.productId}`, RedirectType.replace);
}

/** Arrête la promotion tout de suite ; elle passe dans « Terminées », d'où l'on peut la relancer. */
export async function arreterPromotion(id: string) {
  await verifySession();

  await prisma.product.updateMany({ where: { id, promoPrice: { not: null } }, data: { promoEndsAt: new Date() } });
  updateTag(CATALOGUE_TAG);
  redirect(`/admin/promotions?arret=${id}`, RedirectType.replace);
}

/** Oublie les promotions terminées (le site ne les affiche déjà plus). */
export async function viderPromotionsTerminees() {
  await verifySession();

  const now = new Date();
  const avecPromo = await prisma.product.findMany({
    where: { promoPrice: { not: null } },
    select: { id: true, price: true, promoPrice: true, promoEndsAt: true },
  });
  const terminees = avecPromo.filter((p) => !isPromoActive(p, now)).map((p) => p.id);
  await prisma.product.updateMany({ where: { id: { in: terminees } }, data: { promoPrice: null, promoEndsAt: null } });
  refresh();
}
