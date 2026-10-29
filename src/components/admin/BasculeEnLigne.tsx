"use client";

import { useRouter } from "next/navigation";
import { startTransition, useOptimistic, useState } from "react";

/** Interrupteur des listes (article en ligne, annonce activée…) : la bascule s'affiche tout de suite, puis s'enregistre. */
export function BasculeEnLigne({
  etiquette,
  enLigne,
  action,
  libelles = ["En ligne", "Masqué"],
}: {
  /** Nom de l'interrupteur pour les lecteurs d'écran, par exemple « « Bracelet Trèfle » en ligne ». */
  etiquette: string;
  enLigne: boolean;
  action: (enLigne: boolean) => Promise<{ erreur?: string }>;
  /** Libellés sous l'interrupteur, allumé puis éteint. */
  libelles?: [string, string];
}) {
  const { bfcacheId } = useRouter();
  const [affiche, setAffiche] = useOptimistic(enLigne);
  // Next.js garde la page telle qu'on l'a laissée : un refus s'oublie quand on y revient par un lien,
  // ou quand la valeur enregistrée change (corrigée depuis le formulaire…).
  const [refus, setRefus] = useState<{ erreur: string; visite: string; enLigne: boolean }>();
  const erreur = refus?.visite === bfcacheId && refus.enLigne === enLigne ? refus.erreur : undefined;

  function basculer() {
    startTransition(async () => {
      setAffiche(!affiche);
      const { erreur } = await action(!affiche);
      setRefus(erreur ? { erreur, visite: bfcacheId, enLigne } : undefined);
    });
  }

  return (
    <div className="flex w-16 shrink-0 flex-col items-center gap-1 text-center">
      <button
        type="button"
        role="switch"
        aria-checked={affiche}
        aria-label={etiquette}
        onClick={basculer}
        className={`relative h-7 w-12 rounded-full transition-colors after:absolute after:top-1 after:left-1 after:size-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform focus-visible:ring-2 focus-visible:ring-or focus-visible:ring-offset-2 focus-visible:outline-none ${
          affiche ? "bg-[#1f8f4e] after:translate-x-5" : "bg-encre/15"
        }`}
      />
      <span className={`text-[0.68rem] leading-tight ${erreur ? "text-rubis" : "text-douce"}`}>
        {erreur ?? (affiche ? libelles[0] : libelles[1])}
      </span>
    </div>
  );
}
