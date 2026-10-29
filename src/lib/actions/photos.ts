"use server";

import { verifySession } from "@/lib/dal";
import { enregistrerPhoto, type DossierPhotos, type ExtensionPhoto } from "@/lib/stockage";

const POIDS_MAX = 5 * 1024 * 1024;

/** Format d'après les premiers octets du fichier : une autre extension collée sur le nom ne suffit pas. */
function formatReel(octets: Uint8Array): ExtensionPhoto | null {
  const texte = (debut: number, fin: number) => String.fromCharCode(...octets.subarray(debut, fin));
  if (octets[0] === 0xff && octets[1] === 0xd8 && octets[2] === 0xff) return "jpg";
  if (octets[0] === 0x89 && texte(1, 4) === "PNG") return "png";
  if (texte(0, 4) === "RIFF" && texte(8, 12) === "WEBP") return "webp";
  return null;
}

/** Envoie une photo (déjà réduite par le navigateur) et renvoie son adresse, à enregistrer avec la fiche. */
export async function televerserPhoto(
  dossier: DossierPhotos,
  formData: FormData,
): Promise<{ url: string } | { erreur: string }> {
  await verifySession();
  if (dossier !== "produits" && dossier !== "categories") return { erreur: "Destination inconnue." };

  const photo = formData.get("photo");
  if (!(photo instanceof File) || photo.size === 0) return { erreur: "Aucune photo reçue." };
  if (photo.size > POIDS_MAX) return { erreur: "Photo trop lourde : 5 Mo au maximum." };

  const octets = new Uint8Array(await photo.arrayBuffer());
  const extension = formatReel(octets);
  if (!extension) return { erreur: "Format non pris en charge : envoyez une photo JPEG, PNG ou WebP." };

  return { url: await enregistrerPhoto(octets, extension, dossier) };
}
