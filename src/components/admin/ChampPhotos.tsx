"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, LoaderCircle, X } from "lucide-react";
import { televerserPhoto } from "@/lib/actions/photos";
import type { DossierPhotos } from "@/lib/stockage";
import { reduirePhoto } from "./reduirePhoto";

export type Photo = { url: string; alt: string };

/**
 * Photos d'une fiche : chaque photo choisie est réduite puis envoyée tout de suite ; la fiche
 * n'enregistre que leurs adresses. La première photo est la photo principale.
 */
export function ChampPhotos({
  id,
  photos,
  onChange,
  dossier,
  max = 10,
  onEnvoi,
  erreur,
}: {
  id: string;
  photos: Photo[];
  onChange: (photos: Photo[]) => void;
  dossier: DossierPhotos;
  max?: number;
  /** Prévient le formulaire pendant un envoi, pour qu'il attende avant d'enregistrer. */
  onEnvoi?: (enCours: boolean) => void;
  erreur?: string;
}) {
  const [envoi, setEnvoi] = useState<{ fait: number; total: number } | null>(null);
  const [problemes, setProblemes] = useState<string[]>([]);
  const plusieurs = max > 1;

  async function ajouter(fichiers: File[]) {
    const retenus = fichiers.slice(0, max - photos.length);
    const erreurs =
      retenus.length < fichiers.length
        ? [`${fichiers.length - retenus.length} photo(s) non ajoutée(s) : ${max} au maximum.`]
        : [];
    let liste = photos;
    onEnvoi?.(true);
    for (const [i, fichier] of retenus.entries()) {
      setEnvoi({ fait: i, total: retenus.length });
      try {
        const donnees = new FormData();
        // Si le navigateur ne sait pas réduire ce format, on envoie l'original : le serveur vérifie.
        donnees.set("photo", await reduirePhoto(fichier).catch(() => fichier));
        const resultat = await televerserPhoto(dossier, donnees);
        if ("erreur" in resultat) {
          erreurs.push(`${fichier.name} : ${resultat.erreur}`);
        } else {
          liste = [...liste, { url: resultat.url, alt: "" }];
          onChange(liste);
        }
      } catch {
        erreurs.push(`${fichier.name} : envoi interrompu, vérifiez la connexion puis réessayez.`);
      }
    }
    setEnvoi(null);
    setProblemes(erreurs);
    onEnvoi?.(false);
  }

  function deplacer(index: number, sens: -1 | 1) {
    const copie = [...photos];
    [copie[index], copie[index + sens]] = [copie[index + sens], copie[index]];
    onChange(copie);
  }

  return (
    <div>
      <ul className={`grid gap-2.5 ${plusieurs ? "grid-cols-3 sm:grid-cols-4" : "max-w-48 grid-cols-1"}`}>
        {photos.map((photo, i) => (
          <li key={photo.url} className="relative aspect-square overflow-hidden rounded-xl bg-sable">
            <Image src={photo.url} alt={photo.alt || `Photo ${i + 1}`} fill sizes="(min-width:640px) 180px, 33vw" className="object-cover" />
            {plusieurs && i === 0 && (
              <span className="absolute top-1.5 left-1.5 rounded-full bg-nuit/80 px-2 py-0.5 text-[0.65rem] font-medium text-ivoire">
                Principale
              </span>
            )}
            <button
              type="button"
              onClick={() => onChange(photos.filter((_, n) => n !== i))}
              disabled={!!envoi}
              aria-label={`Retirer la photo ${i + 1}`}
              className="absolute top-1 right-1 grid size-8 place-items-center rounded-full bg-white/90 text-rubis shadow-sm disabled:opacity-50"
            >
              <X size={16} aria-hidden />
            </button>
            {plusieurs && photos.length > 1 && (
              <div className="absolute inset-x-1 bottom-1 flex justify-between">
                <button
                  type="button"
                  onClick={() => deplacer(i, -1)}
                  disabled={!!envoi}
                  aria-label={`Avancer la photo ${i + 1}`}
                  className={`grid size-8 place-items-center rounded-full bg-white/90 text-encre shadow-sm ${i === 0 ? "invisible" : ""}`}
                >
                  <ArrowLeft size={15} aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => deplacer(i, 1)}
                  disabled={!!envoi}
                  aria-label={`Reculer la photo ${i + 1}`}
                  className={`grid size-8 place-items-center rounded-full bg-white/90 text-encre shadow-sm ${i === photos.length - 1 ? "invisible" : ""}`}
                >
                  <ArrowRight size={15} aria-hidden />
                </button>
              </div>
            )}
          </li>
        ))}
        {photos.length < max && (
          <li>
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-filet p-2 text-center text-xs text-douce transition-colors hover:border-or hover:text-or-fonce has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-or">
              {envoi ? (
                <>
                  <LoaderCircle size={22} aria-hidden className="animate-spin" />
                  <span role="status">
                    Envoi {envoi.fait + 1}/{envoi.total}…
                  </span>
                </>
              ) : (
                <>
                  <ImagePlus size={22} aria-hidden />
                  {plusieurs ? "Ajouter des photos" : "Choisir une photo"}
                </>
              )}
              <input
                id={id}
                type="file"
                accept="image/*"
                multiple={plusieurs}
                disabled={!!envoi}
                aria-invalid={erreur ? true : undefined}
                aria-describedby={erreur ? `${id}-erreur` : undefined}
                className="sr-only"
                onChange={(e) => {
                  const fichiers = Array.from(e.target.files ?? []);
                  e.target.value = "";
                  if (fichiers.length > 0) void ajouter(fichiers);
                }}
              />
            </label>
          </li>
        )}
      </ul>
      {problemes.map((p) => (
        <p key={p} className="mt-2 text-sm text-rubis">
          {p}
        </p>
      ))}
      {erreur && (
        <p id={`${id}-erreur`} className="mt-2 text-sm text-rubis">
          {erreur}
        </p>
      )}
    </div>
  );
}
