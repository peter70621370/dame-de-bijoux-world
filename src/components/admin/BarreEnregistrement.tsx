"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { EtatFormulaire } from "@/lib/actions/formulaires";

/**
 * Barre collée en bas des formulaires : réponse du serveur, retour à la liste et bouton d'enregistrement.
 * Quand la fiche a changé ailleurs entre-temps, elle propose de recharger la page.
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
  return (
    <div className="sticky bottom-0 z-10 -mx-4 border-t border-filet bg-ivoire/95 px-4 py-3 backdrop-blur-md md:-mx-8 md:px-8">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-end gap-x-3 gap-y-2">
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
        {etat?.ok && !enCours && (
          <p role="status" className="w-full text-sm text-[#187a42] sm:mr-auto sm:w-auto">
            {etat.ok}
          </p>
        )}
        <Link href={retour} className="bouton bouton-contour flex-1 px-4 sm:flex-none sm:px-7">
          Retour
        </Link>
        <button
          type="submit"
          disabled={enCours || bloque}
          className="bouton bouton-nuit flex-[2] px-4 sm:flex-none sm:px-7"
        >
          {children}
        </button>
      </div>
    </div>
  );
}
