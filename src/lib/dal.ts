import "server-only";
import { cache } from "react";
import { forbidden, redirect } from "next/navigation";
import { connection } from "next/server";
import type { Role } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/session";

export type Admin = { id: string; name: string; email: string; role: Role };

/**
 * Compte connecté, vérifié en base à chaque requête : un compte supprimé, dont le mot de passe
 * ou le rôle a changé, est pris en compte aussitôt. À appeler dans chaque page, lecture et action du back-office.
 */
export const verifySession = cache(async (): Promise<Admin> => {
  // Uniquement au moment de la requête : jamais préparé à l'avance ni gardé en cache par Next.js.
  await connection();
  const session = await readSession();
  if (!session) redirect("/admin/connexion");

  const admin = await prisma.adminUser.findUnique({
    where: { id: session.adminId },
    select: { id: true, name: true, email: true, role: true, sessionVersion: true },
  });
  // Le paramètre empêche proxy.ts de renvoyer vers /admin avec ce cookie devenu caduc.
  if (!admin || admin.sessionVersion !== session.version) redirect("/admin/connexion?session=expiree");

  return { id: admin.id, name: admin.name, email: admin.email, role: admin.role };
});

/**
 * Comme verifySession, réservé aux administrateurs : pages du site (accueil, FAQ, coordonnées) et comptes.
 * Un utilisateur simple voit la page « Accès réservé » (forbidden.tsx).
 */
export async function verifyAdmin(): Promise<Admin> {
  const admin = await verifySession();
  if (admin.role !== "ADMIN") forbidden();
  return admin;
}
