import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

// Photos envoyées depuis le back-office. En local, elles sont rangées dans le dossier `televersements/`
// (hors de public/, ignoré par git) et servies par src/app/televersements/[...chemin]/route.ts.
// À la mise en ligne, ce module les enverra vers Vercel Blob : le reste du site ne manipule que leurs adresses.

export const DOSSIERS_PHOTOS = ["produits", "categories", "annonces", "actualites", "accueil"] as const;
export type DossierPhotos = (typeof DOSSIERS_PHOTOS)[number];

const TYPES = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" } as const;
export type ExtensionPhoto = keyof typeof TYPES;

const RACINE = path.join(process.cwd(), "televersements");
const PREFIXE = "/televersements/";

export async function enregistrerPhoto(contenu: Uint8Array, extension: ExtensionPhoto, dossier: DossierPhotos) {
  const nom = `${randomUUID()}.${extension}`;
  await mkdir(path.join(RACINE, dossier), { recursive: true });
  await writeFile(path.join(RACINE, dossier, nom), contenu);
  return `${PREFIXE}${dossier}/${nom}`;
}

/** Efface une photo envoyée depuis le back-office ; les photos livrées avec le site (public/) ne sont jamais touchées. */
export async function supprimerPhoto(url: string) {
  if (!url.startsWith(PREFIXE)) return;
  const fichier = cheminLocal(url.slice(PREFIXE.length).split("/"));
  if (fichier) await unlink(fichier).catch(() => undefined);
}

export async function lirePhoto(segments: string[]) {
  const fichier = cheminLocal(segments);
  const extension = path.extname(fichier ?? "").slice(1);
  if (!fichier || !(extension in TYPES)) return null;
  // Photos arrivées après la construction du site : rien à embarquer avec le code du serveur.
  const contenu = await readFile(/* turbopackIgnore: true */ fichier).catch(() => null);
  return contenu && { contenu, type: TYPES[extension as ExtensionPhoto] };
}

/** Adresse acceptée dans une fiche : photo envoyée depuis le back-office, ou livrée avec le site (public/). */
export function estPhotoAutorisee(url: string, dossier: DossierPhotos) {
  return (
    new RegExp(`^${PREFIXE}${dossier}/[\\w-]+\\.(jpg|png|webp)$`).test(url) ||
    /^\/(produits|categories)\/[\w.-]+\.(jpe?g|png|webp)$/.test(url)
  );
}

function cheminLocal(segments: string[]) {
  // Seulement « dossier/nom.ext » : impossible de remonter hors de televersements/.
  if (segments.length !== 2 || !segments.every((s) => /^[\w-]+(\.\w+)?$/.test(s))) return null;
  return path.join(RACINE, ...segments);
}
