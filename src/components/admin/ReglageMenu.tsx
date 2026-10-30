"use client";

import { useEffect, useMemo, useSyncExternalStore, type KeyboardEvent, type PointerEvent } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

// Réglage du menu latéral sur ordinateur : bouton (en bas du menu) pour le réduire à ses icônes, poignée au bord droit pour
// l'élargir ou le rétrécir (double-clic : largeur d'origine). Retenu dans ce navigateur.
// La largeur passe par la variable CSS --menu-admin, l'état réduit par l'attribut data-menu-reduit de <html>
// (voir globals.css) : appliqués par le script ci-dessous avant le premier affichage, sans saut du menu.

const CLE = "admin-menu";
const MIN = 224;
const MAX = 400;
/** En deçà, le glissé réduit le menu à ses icônes. */
const SEUIL_REDUIT = 150;

type Menu = { largeur?: number; reduit?: boolean };

const SCRIPT = `try{var m=JSON.parse(localStorage.getItem("${CLE}"));if(m){var h=document.documentElement;if(m.largeur)h.style.setProperty("--menu-admin",m.largeur+"px");if(m.reduit)h.setAttribute("data-menu-reduit","")}}catch(e){}`;

function appliquer({ largeur, reduit }: Menu) {
  const html = document.documentElement;
  if (largeur) html.style.setProperty("--menu-admin", `${largeur}px`);
  else html.style.removeProperty("--menu-admin");
  html.toggleAttribute("data-menu-reduit", !!reduit);
}

// Réglage gardé dans localStorage ; en mémoire si le stockage est indisponible (navigation privée…).
const abonnes = new Set<() => void>();
let enMemoire = "";

function lireBrut() {
  try {
    return localStorage.getItem(CLE) ?? "";
  } catch {
    return enMemoire;
  }
}

function abonner(rappel: () => void) {
  abonnes.add(rappel);
  return () => abonnes.delete(rappel);
}

function regler(menu: Menu) {
  enMemoire = JSON.stringify(menu);
  try {
    localStorage.setItem(CLE, enMemoire);
  } catch {}
  abonnes.forEach((rappel) => rappel());
}

function useMenu() {
  const brut = useSyncExternalStore(abonner, lireBrut, () => "");
  return useMemo<Menu>(() => {
    try {
      return JSON.parse(brut || "{}") ?? {};
    } catch {
      return {};
    }
  }, [brut]);
}

/** Bouton en bas du menu, sous la forme d'une rubrique : réduit le menu à ses icônes, ou le rouvre. */
export function BoutonReduire() {
  const menu = useMenu();
  const libelle = menu.reduit ? "Agrandir le menu" : "Réduire le menu";
  return (
    <button
      type="button"
      onClick={() => regler({ ...menu, reduit: !menu.reduit })}
      title={libelle}
      className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm text-ivoire/75 transition-colors hover:bg-white/5 hover:text-ivoire menu-reduit:justify-center menu-reduit:px-0"
    >
      <PanelLeftClose size={18} aria-hidden className="shrink-0 menu-reduit:hidden" />
      <PanelLeftOpen size={18} aria-hidden className="hidden shrink-0 menu-reduit:block" />
      <span className="truncate menu-reduit:sr-only">{libelle}</span>
    </button>
  );
}

/** Script de démarrage et poignée de largeur, à placer dans le menu fixe. */
export function ReglageMenu() {
  const menu = useMenu();

  // Aussi quand le menu est monté sans rechargement (retour de la page de connexion) : le script n'a pas tourné.
  useEffect(() => appliquer(menu), [menu]);

  const largeur = menu.largeur ?? 272;

  function glisser(e: PointerEvent<HTMLDivElement>) {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    regler(e.clientX < SEUIL_REDUIT ? { ...menu, reduit: true } : { largeur: Math.min(MAX, Math.max(MIN, e.clientX)) });
  }

  const finGlisse = () => document.documentElement.removeAttribute("data-menu-glisse");

  function clavier(e: KeyboardEvent<HTMLDivElement>) {
    const pas = e.key === "ArrowRight" ? 16 : e.key === "ArrowLeft" ? -16 : 0;
    if (!pas) return;
    e.preventDefault();
    if (menu.reduit) {
      if (pas > 0) regler({ ...menu, reduit: false });
      return;
    }
    if (pas < 0 && largeur <= MIN) regler({ ...menu, reduit: true });
    else regler({ largeur: Math.min(MAX, Math.max(MIN, largeur + pas)) });
  }

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Largeur du menu (flèches gauche et droite)"
        aria-valuemin={MIN}
        aria-valuemax={MAX}
        aria-valuenow={menu.reduit ? MIN : largeur}
        tabIndex={0}
        title="Glisser pour élargir ou réduire · double-clic : largeur d’origine"
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          e.preventDefault();
          e.currentTarget.setPointerCapture(e.pointerId);
          document.documentElement.setAttribute("data-menu-glisse", "");
        }}
        onPointerMove={glisser}
        onPointerUp={finGlisse}
        onLostPointerCapture={finGlisse}
        onDoubleClick={() => regler({})}
        onKeyDown={clavier}
        className="group absolute inset-y-0 -right-1.5 w-3 cursor-col-resize touch-none outline-none"
      >
        <span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-or-clair/70 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 group-active:opacity-100" />
      </div>
    </>
  );
}
