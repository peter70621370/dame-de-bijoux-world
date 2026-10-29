"use client";

import { startTransition, useOptimistic, useState } from "react";
import { basculerEnLigne } from "@/lib/actions/articles";

/** Interrupteur « En ligne » de la liste des articles : la bascule s'affiche tout de suite, puis s'enregistre. */
export function BasculeEnLigne({ id, nom, enLigne }: { id: string; nom: string; enLigne: boolean }) {
  const [affiche, setAffiche] = useOptimistic(enLigne);
  const [erreur, setErreur] = useState<string>();

  function basculer() {
    startTransition(async () => {
      setAffiche(!affiche);
      setErreur((await basculerEnLigne(id, !affiche)).erreur);
    });
  }

  return (
    <div className="flex w-16 shrink-0 flex-col items-center gap-1 text-center">
      <button
        type="button"
        role="switch"
        aria-checked={affiche}
        aria-label={`« ${nom} » en ligne`}
        onClick={basculer}
        className={`relative h-7 w-12 rounded-full transition-colors after:absolute after:top-1 after:left-1 after:size-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform focus-visible:ring-2 focus-visible:ring-or focus-visible:ring-offset-2 focus-visible:outline-none ${
          affiche ? "bg-[#1f8f4e] after:translate-x-5" : "bg-encre/15"
        }`}
      />
      <span className={`text-[0.68rem] leading-tight ${erreur ? "text-rubis" : "text-douce"}`}>
        {erreur ?? (affiche ? "En ligne" : "Masqué")}
      </span>
    </div>
  );
}
