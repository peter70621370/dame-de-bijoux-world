-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'UTILISATEUR');

-- AlterTable
-- Les comptes qui existent déjà gardent tous leurs droits ; les nouveaux sont « Utilisateur » sauf choix contraire.
ALTER TABLE "AdminUser" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'ADMIN';
ALTER TABLE "AdminUser" ALTER COLUMN "role" SET DEFAULT 'UTILISATEUR';
