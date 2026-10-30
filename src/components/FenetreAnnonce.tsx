"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Fenetre } from "@/lib/annonces";
import { LienAnnonce } from "./BandeauAnnonce";
import { IconArrow, IconClose } from "./icons";
import { LogoEmbleme } from "./LogoEmbleme";

/** Version de la fenêtre que ce navigateur a déjà vue. */
const CLE_VUE = "dame-de-bijoux:fenetre-vue";

/**
 * Fenêtre d'annonce à l'arrivée sur le site : une fois par visiteur et par version, après l'intro du logo.
 * L'adresse « ?apercu=fenetre » l'ouvre à chaque fois (bouton « Voir sur le site » du back-office).
 */
export function FenetreAnnonce({ fenetre }: { fenetre: Fenetre }) {
  const dialogue = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const apercu = new URLSearchParams(window.location.search).get("apercu") === "fenetre";
    try {
      if (!apercu && localStorage.getItem(CLE_VUE) === fenetre.version) return;
    } catch {
      // Stockage refusé (navigation privée…) : la fenêtre s'ouvre, tant pis si c'est à chaque visite.
    }

    // D'abord l'intro du logo, puis un instant pour découvrir la page : la fenêtre ne surgit pas sous les yeux.
    const html = document.documentElement;
    let minuterie = 0;
    function attendre() {
      clearTimeout(minuterie);
      if (html.classList.contains("intro-en-cours")) return;
      minuterie = window.setTimeout(
        () => {
          if (html.classList.contains("intro-en-cours") || dialogue.current?.open) return;
          observateur.disconnect();
          dialogue.current?.showModal();
          // Notée vue dès l'ouverture : l'événement « close » attend l'affichage suivant et se perd
          // si la personne quitte l'onglet sans la fermer (lien WhatsApp ouvert à côté…).
          try {
            localStorage.setItem(CLE_VUE, fenetre.version);
          } catch {
            // Stockage refusé : elle se rouvrira à la prochaine visite.
          }
        },
        apercu ? 400 : 1500,
      );
    }
    const observateur = new MutationObserver(attendre);
    observateur.observe(html, { attributes: true, attributeFilter: ["class"] });
    attendre();
    return () => {
      observateur.disconnect();
      clearTimeout(minuterie);
    };
  }, [fenetre.version]);

  const fermer = () => dialogue.current?.close();

  return (
    <dialog
      ref={dialogue}
      aria-labelledby="fenetre-annonce-titre"
      onClick={(e) => e.target === e.currentTarget && fermer()}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(26rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border-0 bg-ivoire p-0 text-encre shadow-2xl open:animate-monte backdrop:bg-nuit/70 backdrop:backdrop-blur-sm"
    >
      <ContenuFenetre fenetre={fenetre} titreId="fenetre-annonce-titre" onFermer={fermer} />
    </dialog>
  );
}

/** Contenu de la fenêtre, partagé avec l'aperçu du back-office (`apercu` : le bouton ne mène nulle part). */
export function ContenuFenetre({
  fenetre,
  titreId,
  onFermer,
  apercu = false,
}: {
  fenetre: Omit<Fenetre, "version">;
  titreId?: string;
  onFermer?: () => void;
  apercu?: boolean;
}) {
  const { titre, texte, image, lien } = fenetre;
  return (
    <div className="relative">
      {image && (
        <div className="relative aspect-[4/3] bg-sable">
          <Image
            src={image}
            alt=""
            fill
            sizes="(min-width: 28rem) 26rem, calc(100vw - 2rem)"
            className="object-cover"
          />
        </div>
      )}
      <button
        type="button"
        onClick={onFermer}
        aria-label="Fermer"
        className="absolute top-3 right-3 grid size-10 place-items-center rounded-full bg-ivoire/90 text-encre shadow-sm transition-colors hover:bg-ivoire"
      >
        <IconClose width={18} height={18} />
      </button>

      <div className="px-6 pt-7 pb-6 text-center sm:px-8">
        {!image && <LogoEmbleme className="mx-auto mb-5 size-16" />}
        <h2 id={titreId} className="titre text-[2rem] break-words">
          {titre}
        </h2>
        {texte && <p className="mt-3 leading-relaxed whitespace-pre-line text-douce">{texte}</p>}
        <div className="mt-7 grid gap-1">
          {lien ? (
            <>
              <LienAnnonce lien={lien} apercu={apercu} onClick={onFermer} className="bouton bouton-nuit w-full">
                {lien.label} <IconArrow width={16} height={16} />
              </LienAnnonce>
              <button
                type="button"
                onClick={onFermer}
                className="h-11 text-sm text-douce underline underline-offset-4 transition-colors hover:text-encre"
              >
                Plus tard
              </button>
            </>
          ) : (
            <button type="button" onClick={onFermer} className="bouton bouton-nuit w-full">
              Fermer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
