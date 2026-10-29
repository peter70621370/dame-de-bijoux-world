import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/session";

export type Admin = { id: string; name: string; email: string };

/**
 * Compte connecté, vérifié en base à chaque requête : un compte supprimé ou dont le mot de
 * passe a changé perd l'accès aussitôt. À appeler dans chaque page, lecture et action du back-office.
 */
export const verifySession = cache(async (): Promise<Admin> => {
  // Uniquement au moment de la requête : jamais préparé à l'avance ni gardé en cache par Next.js.
  await connection();
  const session = await readSession();
  if (!session) redirect("/admin/connexion");

  const admin = await prisma.adminUser.findUnique({
    where: { id: session.adminId },
    select: { id: true, name: true, email: true, sessionVersion: true },
  });
  // Le paramètre empêche proxy.ts de renvoyer vers /admin avec ce cookie devenu caduc.
  if (!admin || admin.sessionVersion !== session.version) redirect("/admin/connexion?session=expiree");

  return { id: admin.id, name: admin.name, email: admin.email };
});
