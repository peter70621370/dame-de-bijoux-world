"use client";

import { useActionState, useRef } from "react";
import type { EtatFormulaire } from "@/lib/actions/formulaires";

/**
 * useActionState d'un formulaire de fiche existante : joint à chaque envoi la version de la fiche sur laquelle
 * portent les champs, puis retient celle qui vient d'être enregistrée. Le serveur refuse d'enregistrer si la
 * fiche a changé ailleurs entre-temps (`version` vide : fiche nouvelle).
 */
export function useEnregistrement(
  action: (etat: EtatFormulaire, formData: FormData) => Promise<EtatFormulaire>,
  version: string,
) {
  const derniere = useRef(version);
  return useActionState(async (precedent: EtatFormulaire, donnees: FormData) => {
    donnees.set("version", derniere.current);
    const resultat = await action(precedent, donnees);
    if (resultat?.version) derniere.current = resultat.version;
    return resultat;
  }, undefined);
}
