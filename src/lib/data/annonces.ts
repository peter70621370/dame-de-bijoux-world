import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { etatAnnonce, versBandeau, versFenetre, type Bandeau, type Fenetre } from "@/lib/annonces";
import { prisma } from "@/lib/prisma";

/** Tag à rafraîchir (updateTag) après chaque modification du bandeau ou de la fenêtre. */
export const ANNONCES_TAG = "annonces";

const JOUR = 24 * 3600;

/** Bandeau et fenêtre à montrer maintenant sur le site (null : rien à montrer). */
export async function getAnnoncesEnCours(): Promise<{ bandeau: Bandeau | null; fenetre: Fenetre | null }> {
  "use cache";
  cacheTag(ANNONCES_TAG);

  const annonces = await prisma.announcement.findMany();
  const now = new Date();

  // Une annonce programmée apparaît et disparaît d'elle-même : le cache est recalculé au prochain début ou à la prochaine fin.
  const echeances = annonces
    .filter((a) => a.enabled)
    .flatMap((a) => [a.startsAt, a.endsAt])
    .flatMap((d) => (d && d > now ? [d.getTime()] : []));
  if (echeances.length > 0) {
    const secondes = Math.ceil((Math.min(...echeances) - now.getTime()) / 1000);
    cacheLife({ stale: 300, revalidate: Math.min(30 * JOUR, Math.max(60, secondes)), expire: 365 * JOUR });
  } else {
    cacheLife("max");
  }

  const enLigne = (id: string) => annonces.find((a) => a.id === id && etatAnnonce(a, now) === "en-ligne");
  const bandeau = enLigne("bandeau");
  const fenetre = enLigne("fenetre");

  return {
    bandeau: bandeau?.text ? versBandeau(bandeau) : null,
    fenetre: fenetre?.title ? versFenetre(fenetre) : null,
  };
}
