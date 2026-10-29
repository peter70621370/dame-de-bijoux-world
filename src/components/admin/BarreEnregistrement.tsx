"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { EtatFormulaire } from "@/lib/actions/formulaires";
import { useConfirmationEnregistrement } from "./Confirmation";

/**
 * Barre flottante en bas des formulaires, de la largeur des cartes : erreur éventuelle, retour à la liste
 * et bouton d'enregistrement. Quand la fiche a changé ailleurs entre-temps, elle propose de recharger la page.
 * Un enregistrement réussi s'annonce dans la fenêtre « Succès ».
 */
export function BarreEnregistrement({
  etat,
  enCours,
  retour,
  bloque = false,
  children,
}: {
  etat: EtatFormulaire;
  enCours: boolean;
  /** Adresse du bouton « Retour ». */
  retour: string;
  /** Enregistrement impossible pour l'instant (photo en cours d'envoi…). */
  bloque?: boolean;
  /** Texte du bouton d'enregistrement. */
  children: ReactNode;
}) {
  useConfirmationEnregistrement(etat);

  return (
    <div className="sticky bottom-3 z-10 rounded-2xl border border-filet bg-white/90 p-3 shadow-[0_16px_40px_-16px_rgb(21_11_17/0.35)] backdrop-blur-md md:bottom-5 md:px-5">
      <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-2">
        {etat?.message && !enCours && (
          <p role="alert" className="w-full text-sm text-rubis sm:mr-auto sm:w-auto">
            {etat.message}
            {etat.conflit && (
              <>
                {" "}
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="font-medium underline underline-offset-4"
                >
                  Recharger
                </button>
              </>
            )}
          </p>
        )}
        {/* Sur téléphone, « Retour » reste compact pour que le bouton principal tienne sur une ligne. */}
        <Link href={retour} className="bouton bouton-contour px-5 sm:px-7">
          Retour
        </Link>
        <button
          type="submit"
          disabled={enCours || bloque}
          className="bouton bouton-nuit flex-1 px-4 tracking-[0.14em] whitespace-nowrap sm:flex-none sm:px-7 sm:tracking-[0.2em]"
        >
          {children}
        </button>
      </div>
    </div>
  );
}
