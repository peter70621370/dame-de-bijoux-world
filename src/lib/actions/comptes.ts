"use server";

import bcrypt from "bcryptjs";
import { refresh } from "next/cache";
import { redirect, RedirectType } from "next/navigation";
import { z } from "zod";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { erreursParChamp, type EtatFormulaire } from "./formulaires";

const nom = z.string().trim().min(2, "Indiquez le nom affiché.").max(40, "40 caractères au maximum.");
const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(120, "Adresse trop longue.")
  .pipe(z.email("Adresse e-mail non valide."));
const motDePasse = z
  .string()
  .min(10, "10 caractères au minimum.")
  .max(64, "64 caractères au maximum.")
  // bcrypt ne lit que les 72 premiers octets : au-delà (accents nombreux), la fin serait ignorée.
  .refine((m) => new TextEncoder().encode(m).length <= 72, "Trop de caractères accentués : raccourcissez-le.");

const VERIFIEZ = "Vérifiez les champs signalés en rouge.";

const lire = (formData: FormData, cle: string) => String(formData.get(cle) ?? "");

async function adresseDejaPrise(adresse: string, sauf?: string) {
  const autre = await prisma.adminUser.findFirst({
    where: { email: adresse, ...(sauf ? { NOT: { id: sauf } } : {}) },
    select: { id: true },
  });
  return Boolean(autre);
}

/** Ajoute un compte au back-office. */
export async function creerCompte(_etat: EtatFormulaire, formData: FormData): Promise<EtatFormulaire> {
  await verifySession();

  const resultat = z
    .object({ name: nom, email, password: motDePasse })
    .safeParse({ name: lire(formData, "name"), email: lire(formData, "email"), password: lire(formData, "password") });
  if (!resultat.success) return { message: VERIFIEZ, erreurs: erreursParChamp(resultat.error.issues) };
  const c = resultat.data;

  if (await adresseDejaPrise(c.email)) {
    return { message: VERIFIEZ, erreurs: { email: "Un compte utilise déjà cette adresse." } };
  }
  const compte = await prisma.adminUser.create({
    data: { name: c.name, email: c.email, passwordHash: await bcrypt.hash(c.password, 12) },
  });
  redirect(`/admin/comptes?ajout=${compte.id}`, RedirectType.replace);
}

/** Nom et adresse de connexion du compte connecté. */
export async function enregistrerProfil(_etat: EtatFormulaire, formData: FormData): Promise<EtatFormulaire> {
  const admin = await verifySession();

  const resultat = z.object({ name: nom, email }).safeParse({ name: lire(formData, "name"), email: lire(formData, "email") });
  if (!resultat.success) return { message: VERIFIEZ, erreurs: erreursParChamp(resultat.error.issues) };
  const p = resultat.data;

  if (await adresseDejaPrise(p.email, admin.id)) {
    return { message: VERIFIEZ, erreurs: { email: "Un autre compte utilise déjà cette adresse." } };
  }
  await prisma.adminUser.update({ where: { id: admin.id }, data: p });
  refresh();
  return {
    ok:
      p.email !== admin.email
        ? `Enregistré : connectez-vous désormais avec ${p.email}.`
        : "Modifications enregistrées.",
  };
}

/**
 * Change le mot de passe du compte connecté, après vérification de l'actuel.
 * Les autres appareils sont déconnectés ; celui-ci reste connecté avec une session neuve.
 */
export async function changerMotDePasse(_etat: EtatFormulaire, formData: FormData): Promise<EtatFormulaire> {
  const admin = await verifySession();

  const resultat = z
    .object({ actuel: z.string().min(1, "Indiquez votre mot de passe actuel."), password: motDePasse, confirmation: z.string() })
    .refine((m) => m.password === m.confirmation, { path: ["confirmation"], message: "Les deux saisies diffèrent." })
    .safeParse({
      actuel: lire(formData, "actuel"),
      password: lire(formData, "password"),
      confirmation: lire(formData, "confirmation"),
    });
  if (!resultat.success) return { message: VERIFIEZ, erreurs: erreursParChamp(resultat.error.issues) };
  const m = resultat.data;

  const compte = await prisma.adminUser.findUniqueOrThrow({ where: { id: admin.id }, select: { passwordHash: true } });
  if (!(await bcrypt.compare(m.actuel, compte.passwordHash))) {
    return { message: VERIFIEZ, erreurs: { actuel: "Mot de passe actuel incorrect." } };
  }

  const { sessionVersion } = await prisma.adminUser.update({
    where: { id: admin.id },
    data: { passwordHash: await bcrypt.hash(m.password, 12), sessionVersion: { increment: 1 } },
    select: { sessionVersion: true },
  });
  await createSession({ adminId: admin.id, version: sessionVersion });
  return { ok: "Mot de passe changé. Vos autres appareils devront se reconnecter." };
}

/** Donne un nouveau mot de passe à un autre compte (oublié, bloqué) : ses appareils sont déconnectés. */
export async function reinitialiserMotDePasse(
  id: string,
  _etat: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  const admin = await verifySession();
  if (id === admin.id) return { message: "Pour votre propre compte, utilisez « Changer mon mot de passe »." };

  const resultat = z
    .object({ password: motDePasse, confirmation: z.string() })
    .refine((m) => m.password === m.confirmation, { path: ["confirmation"], message: "Les deux saisies diffèrent." })
    .safeParse({ password: lire(formData, "password"), confirmation: lire(formData, "confirmation") });
  if (!resultat.success) return { message: VERIFIEZ, erreurs: erreursParChamp(resultat.error.issues) };

  const compte = await prisma.adminUser
    .update({
      where: { id },
      data: {
        passwordHash: await bcrypt.hash(resultat.data.password, 12),
        sessionVersion: { increment: 1 },
        failedLogins: 0,
        lockedUntil: null,
      },
      select: { name: true },
    })
    .catch(() => null);
  if (!compte) return { message: "Ce compte n’existe plus : il a peut-être été supprimé entre-temps." };

  refresh();
  return { ok: `Nouveau mot de passe enregistré : transmettez-le à ${compte.name} de vive voix.` };
}

/** Supprime un autre compte ; on ne peut supprimer ni le sien, ni le dernier. */
export async function supprimerCompte(id: string) {
  const admin = await verifySession();
  if (id === admin.id || (await prisma.adminUser.count()) <= 1) redirect(`/admin/comptes/${id}`, RedirectType.replace);

  await prisma.adminUser.deleteMany({ where: { id } });
  redirect("/admin/comptes?suppression=1", RedirectType.replace);
}
