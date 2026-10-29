import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { reglagesParDefaut, versBoutique, type Boutique } from "@/lib/boutique";
import { prisma } from "@/lib/prisma";

/** Tag à rafraîchir (updateTag) après chaque modification des coordonnées. */
export const BOUTIQUE_TAG = "boutique";

export async function getBoutique(): Promise<Boutique> {
  "use cache";
  cacheTag(BOUTIQUE_TAG);
  cacheLife("max");

  const reglages = await prisma.shopSettings.findUnique({ where: { id: "boutique" } });
  return versBoutique(reglages ?? reglagesParDefaut);
}
