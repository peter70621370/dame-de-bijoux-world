"use client";

import { createContext, use, useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { CircleCheck } from "lucide-react";
import type { EtatFormulaire } from "@/lib/actions/formulaires";

// Fenêtre « Succès » après un enregistrement, un ajout ou une suppression : elle reste ouverte jusqu'au clic sur « OK ».

const Afficher = createContext<(message: ReactNode) => void>(() => {});

/** Une seule fenêtre à la fois : les messages suivants attendent que la précédente soit fermée. */
export function ConfirmationProvider({ children }: { children: ReactNode }) {
  const [file, setFile] = useState<{ id: number; message: ReactNode }[]>([]);
  const prochain = useRef(0);
  const fenetre = useRef<HTMLDialogElement>(null);
  const titre = useId();
  const courant = file[0];

  const afficher = useCallback((message: ReactNode) => {
    const id = prochain.current++;
    setFile((f) => [...f, { id, message }]);
  }, []);

  useEffect(() => {
    if (courant && !fenetre.current?.open) fenetre.current?.showModal();
  }, [courant]);

  // Par l'identifiant : « OK » puis l'événement close retirent le même message, une seule fois.
  const retirer = () => courant && setFile((f) => f.filter((m) => m.id !== courant.id));

  return (
    <Afficher value={afficher}>
      {children}
      <dialog
        ref={fenetre}
        role="alertdialog"
        aria-labelledby={titre}
        // Fermée par « OK » ou la touche Échap : on passe au message suivant.
        onClose={retirer}
        // Un lien du message (« Ajouter une question »…) mène ailleurs : la fenêtre se ferme avec.
        onClick={(e) => {
          if (!(e.target as HTMLElement).closest("a")) return;
          fenetre.current?.close();
          retirer();
        }}
        className="m-auto w-[min(24rem,calc(100vw-2rem))] rounded-2xl border-0 bg-white p-6 text-center text-encre backdrop:bg-nuit/60 backdrop:backdrop-blur-sm md:p-7"
      >
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#1f8f4e]/10 text-[#187a42]">
          <CircleCheck size={30} aria-hidden />
        </span>
        <h2 id={titre} className="mt-4 font-serif text-2xl">
          Succès
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-douce">{courant?.message}</p>
        <button
          type="button"
          autoFocus
          onClick={() => {
            fenetre.current?.close();
            retirer();
          }}
          className="bouton bouton-nuit mt-6 w-full"
        >
          OK
        </button>
      </dialog>
    </Afficher>
  );
}

/**
 * Ouvre la fenêtre quand le serveur confirme un enregistrement (`etat.ok`). Une seule fois par réponse :
 * Next.js remet en place les pages déjà visitées, et leurs effets avec, sans qu'il faille la rouvrir.
 */
export function useConfirmationEnregistrement(etat: EtatFormulaire) {
  const afficher = use(Afficher);
  const deja = useRef<EtatFormulaire>(undefined);

  useEffect(() => {
    if (!etat?.ok || deja.current === etat) return;
    deja.current = etat;
    afficher(etat.ok);
  }, [etat, afficher]);
}

/** Paramètres d'adresse posés par les actions après un ajout ou une suppression (voir src/lib/actions). */
const PARAMETRES = ["ajout", "suppression", "rubrique", "promo", "arret"];

/**
 * Confirmation après une redirection (article ajouté, compte supprimé…) : ouvre la fenêtre et retire le
 * paramètre de l'adresse, pour qu'un retour sur la page ne la rouvre pas.
 */
export function Avis({ children }: { children: ReactNode }) {
  const afficher = use(Afficher);
  // Le message déjà annoncé : un nouvel ajout sur la même page (gardée par Next.js) en apporte un autre.
  const deja = useRef<ReactNode>(null);

  useEffect(() => {
    if (deja.current === children) return;
    deja.current = children;
    afficher(children);
    const adresse = new URL(window.location.href);
    PARAMETRES.forEach((p) => adresse.searchParams.delete(p));
    window.history.replaceState(window.history.state, "", adresse);
  }, [afficher, children]);

  return null;
}
