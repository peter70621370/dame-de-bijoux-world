"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";

const ESSAIS_MAX = 5;
const BLOCAGE_MS = 15 * 60 * 1000;

// Empreinte d'un mot de passe jetable : quand l'adresse est inconnue, on compare quand même
// contre elle pour répondre aussi lentement que pour un vrai compte, sans trahir quelles adresses existent.
const EMPREINTE_FACTICE = "$2b$12$hAaTziV8VLnu.wa8cpNUceWzKv11g/zMjWsdWqpUSUeU64aRjzFRu";

const ConnexionSchema = z.object({
  email: z.string().trim().toLowerCase().min(1),
  password: z.string().min(1),
});

export type ConnexionState = { error: string; email: string } | undefined;

export async function connexion(_prev: ConnexionState, formData: FormData): Promise<ConnexionState> {
  const parsed = ConnexionSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return {
      error: "Renseignez votre adresse e-mail et votre mot de passe.",
      email: String(formData.get("email") ?? ""),
    };
  }
  const { email, password } = parsed.data;

  const admin = await prisma.adminUser.findUnique({ where: { email } });

  if (admin?.lockedUntil && admin.lockedUntil > new Date()) {
    const minutes = Math.ceil((admin.lockedUntil.getTime() - Date.now()) / 60_000);
    return {
      error: `Trop d’essais ratés : réessayez dans ${minutes} minute${minutes > 1 ? "s" : ""}.`,
      email,
    };
  }

  const valide = await bcrypt.compare(password, admin?.passwordHash ?? EMPREINTE_FACTICE);
  if (!admin || !valide) {
    if (admin) {
      const { failedLogins } = await prisma.adminUser.update({
        where: { id: admin.id },
        data: { failedLogins: { increment: 1 } },
      });
      if (failedLogins >= ESSAIS_MAX) {
        await prisma.adminUser.update({
          where: { id: admin.id },
          data: { failedLogins: 0, lockedUntil: new Date(Date.now() + BLOCAGE_MS) },
        });
      }
    }
    return { error: "Adresse e-mail ou mot de passe incorrect.", email };
  }

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { failedLogins: 0, lockedUntil: null, lastLoginAt: new Date() },
  });
  await createSession({ adminId: admin.id, version: admin.sessionVersion });
  redirect("/admin");
}

export async function deconnexion() {
  await deleteSession();
  redirect("/admin/connexion");
}
