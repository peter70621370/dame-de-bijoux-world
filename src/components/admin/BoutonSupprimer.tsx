"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { Trash2 } from "lucide-react";

/** Bouton de suppression qui demande confirmation dans une fenêtre avant d'appeler `action`. */
export function BoutonSupprimer({
  action,
  libelle,
  titre,
  message,
}: {
  action: () => Promise<void>;
  libelle: string;
  titre: string;
  message: string;
}) {
  const fenetre = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => fenetre.current?.showModal()}
        className="inline-flex h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-rubis transition-colors hover:bg-rubis/8"
      >
        <Trash2 size={16} aria-hidden /> {libelle}
      </button>
      <dialog
        ref={fenetre}
        aria-label={titre}
        onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
        className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-2xl border-0 bg-white p-6 text-encre backdrop:bg-nuit/60 backdrop:backdrop-blur-sm"
      >
        <h2 className="font-serif text-2xl">{titre}</h2>
        <p className="mt-2 text-sm leading-relaxed text-douce">{message}</p>
        <form action={action} className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => fenetre.current?.close()} className="bouton bouton-contour">
            Annuler
          </button>
          <Confirmer />
        </form>
      </dialog>
    </>
  );
}

function Confirmer() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="bouton border-rubis bg-rubis text-white hover:bg-rubis/90">
      {pending ? "Suppression…" : "Supprimer"}
    </button>
  );
}
