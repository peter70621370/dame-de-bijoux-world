// Rôles des comptes de l'espace admin : libellés partagés par les pages et les formulaires.
import type { Role } from "@/generated/prisma/enums";

export const ROLES: Record<Role, { label: string; description: string }> = {
  ADMIN: {
    label: "Administrateur",
    description: "Tout l’espace admin, y compris la page d’accueil, la FAQ, les coordonnées et les comptes.",
  },
  UTILISATEUR: {
    label: "Utilisateur",
    description: "Articles, catégories, promotions, bandeau et actualités. Pas les pages du site ni les comptes.",
  },
};

export const ORDRE_ROLES: Role[] = ["UTILISATEUR", "ADMIN"];
