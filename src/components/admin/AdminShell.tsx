"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useRef, type ReactNode } from "react";
import {
  BadgePercent,
  CircleQuestionMark,
  ExternalLink,
  Gem,
  House,
  LayoutDashboard,
  Megaphone,
  Menu,
  Newspaper,
  Store,
  Tags,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { LogoEmbleme } from "@/components/LogoEmbleme";

type Session = { nom: ReactNode; compte: ReactNode };

type Lien ={ href: string; label: string; icon: LucideIcon; pret?: boolean };

// Toutes les rubriques prévues ; celles qui ne sont pas encore construites restent visibles, marquées « Bientôt ».
const SECTIONS: { titre?: string; liens: Lien[] }[] = [
  { liens: [{ href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, pret: true }] },
  {
    titre: "Catalogue",
    liens: [
      { href: "/admin/articles", label: "Articles", icon: Gem, pret: true },
      { href: "/admin/categories", label: "Catégories", icon: Tags, pret: true },
      { href: "/admin/promotions", label: "Promotions", icon: BadgePercent, pret: true },
    ],
  },
  {
    titre: "Annonces",
    liens: [
      { href: "/admin/annonces", label: "Bandeau & fenêtre", icon: Megaphone },
      { href: "/admin/actualites", label: "Actualités", icon: Newspaper },
    ],
  },
  {
    titre: "Site",
    liens: [
      { href: "/admin/accueil", label: "Page d’accueil", icon: House },
      { href: "/admin/faq", label: "FAQ", icon: CircleQuestionMark },
      { href: "/admin/coordonnees", label: "Coordonnées", icon: Store },
    ],
  },
  { titre: "Administration", liens: [{ href: "/admin/comptes", label: "Comptes", icon: Users }] },
];

/**
 * Habillage du back-office : menu latéral (tiroir sur téléphone) et barre du haut.
 * `nom` et `compte` : nom affiché sous le logo et bloc du compte connecté, rendus par le serveur.
 */
export function AdminShell({ nom, compte, children }: Session & { children: ReactNode }) {
  const tiroir = useRef<HTMLDialogElement>(null);

  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-sable/50 lg:pl-68">
      {/* Menu collé en haut, barre « Enregistrer » collée en bas des formulaires : les débuts de page et les champs
          atteints au clavier ne passent pas dessous. Règle coupée quand Next.js masque le back-office (vers le site). */}
      <style
        ref={(style) => {
          if (style) style.media = "";
          return () => {
            if (style) style.media = "not all";
          };
        }}
      >
        {"html { scroll-padding-top: 5rem; scroll-padding-bottom: 6rem; }" +
          "@media (min-width: 64rem) { html { scroll-padding-top: 1.5rem; } }"}
      </style>
      <a
        href="#contenu-admin"
        className="sr-only z-[60] bg-nuit px-4 py-3 text-ivoire focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Aller au contenu
      </a>

      <aside className="fixed inset-y-0 left-0 hidden w-68 bg-nuit text-ivoire lg:block">
        <Rubriques nom={nom} compte={compte} />
      </aside>

      <dialog
        ref={tiroir}
        aria-label="Menu du back-office"
        onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
        className="m-0 h-dvh max-h-none w-80 max-w-[86vw] border-0 bg-nuit p-0 text-ivoire open:animate-glisse backdrop:bg-nuit/60 backdrop:backdrop-blur-sm lg:hidden"
      >
        <button
          type="button"
          onClick={() => tiroir.current?.close()}
          aria-label="Fermer le menu"
          className="absolute top-4 right-3 grid size-10 place-items-center rounded-lg text-ivoire/70 hover:bg-white/10 hover:text-ivoire"
        >
          <X size={20} aria-hidden />
        </button>
        <Rubriques nom={nom} compte={compte} onNavigate={() => tiroir.current?.close()} />
      </dialog>

      {/* Sur ordinateur, le menu reste affiché : la barre ne sert qu'au téléphone. */}
      <header className="sticky top-0 z-30 border-b border-filet bg-ivoire/85 backdrop-blur-md lg:hidden">
        <div className="flex h-16 items-center gap-3 px-4 md:px-8">
          <button
            type="button"
            onClick={() => tiroir.current?.showModal()}
            aria-label="Ouvrir le menu"
            className="-ml-1 grid size-10 place-items-center rounded-lg text-encre hover:bg-sable"
          >
            <Menu size={22} aria-hidden />
          </button>
          <Link href="/admin" className="flex items-center gap-2.5">
            <LogoEmbleme className="h-7 w-auto text-or-fonce" />
            <span className="font-serif text-xl leading-none">Back-office</span>
          </Link>
        </div>
      </header>

      <main id="contenu-admin" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8 md:py-10">
        {children}
      </main>
    </div>
  );
}

/**
 * Menu, rubrique en cours surlignée. Sur les pages à adresse variable (une fiche article…), l'adresse n'est connue
 * qu'à la visite : le menu s'affiche d'abord sans surlignage, qui arrive aussitôt après.
 */
function Rubriques(props: Session & { onNavigate?: () => void }) {
  return (
    <Suspense fallback={<Navigation pathname={null} {...props} />}>
      <NavigationActive {...props} />
    </Suspense>
  );
}

function NavigationActive(props: Session & { onNavigate?: () => void }) {
  return <Navigation pathname={usePathname()} {...props} />;
}

function Navigation({
  pathname,
  nom,
  compte,
  onNavigate,
}: Session & {
  pathname: string | null;
  onNavigate?: () => void;
}) {
  return (
    // Logo en haut et compte en bas restent en place ; seules les rubriques défilent sur un écran bas.
    <nav aria-label="Back-office" className="flex h-full flex-col px-4 pt-6 pb-4">
      <Link href="/admin" onClick={onNavigate} className="flex shrink-0 items-center gap-3 px-2">
        <LogoEmbleme className="h-10 w-auto text-or" />
        <span className="min-w-0 leading-tight whitespace-nowrap">
          <span className="block font-serif text-lg font-semibold uppercase tracking-[0.08em]">Dame de Bijoux</span>
          <span className="eyebrow mt-0.5 block min-h-[1.2em] truncate text-[0.6rem] text-or-clair">{nom}</span>
        </span>
      </Link>

      {/* Barre de défilement fine et sombre, assortie au menu (la barre claire du navigateur jurait). */}
      <div className="-mx-4 mt-6 min-h-0 flex-1 space-y-5 overflow-y-auto px-4 pb-5 [scrollbar-color:rgb(255_255_255/0.18)_transparent] [scrollbar-width:thin]">
        {SECTIONS.map((section, i) => (
          <div key={section.titre ?? i}>
            {section.titre && (
              <p className="eyebrow mb-1.5 px-3 text-[0.6rem] text-ivoire/40">{section.titre}</p>
            )}
            <ul className="space-y-0.5">
              {section.liens.map(({ href, label, icon: Icon, pret }) => {
                const actif = pathname !== null && (href === "/admin" ? pathname === href : pathname.startsWith(href));
                if (!pret) {
                  return (
                    <li key={href}>
                      <span
                        aria-disabled="true"
                        className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm text-ivoire/40"
                      >
                        <Icon size={18} aria-hidden className="shrink-0" />
                        <span className="truncate">{label}</span>
                        <span className="ml-auto shrink-0 text-[0.68rem] italic text-ivoire/35">bientôt</span>
                      </span>
                    </li>
                  );
                }
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      aria-current={actif ? "page" : undefined}
                      className={`relative flex h-10 items-center gap-3 rounded-xl px-3 text-sm transition-colors ${
                        actif ? "bg-white/10 text-ivoire" : "text-ivoire/75 hover:bg-white/5 hover:text-ivoire"
                      }`}
                    >
                      {actif && <span className="absolute inset-y-2.5 left-0 w-0.5 rounded-full bg-or" aria-hidden />}
                      <Icon size={18} aria-hidden className={`shrink-0 ${actif ? "text-or-clair" : ""}`} />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="shrink-0 space-y-2 border-t border-white/10 pt-2">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm text-ivoire/75 transition-colors hover:bg-white/5 hover:text-ivoire"
        >
          <ExternalLink size={18} aria-hidden className="shrink-0" /> Voir le site
        </a>
        {compte}
      </div>
    </nav>
  );
}
