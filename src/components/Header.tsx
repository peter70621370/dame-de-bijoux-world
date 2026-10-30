"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navigation, site } from "@/lib/site";
import { greetingUrl } from "@/lib/whatsapp";
import { useBoutique } from "./BoutiqueProvider";
import { useCart } from "./cart/CartProvider";
import { LogoEmbleme } from "./LogoEmbleme";
import { IconBag, IconClose, IconMenu, IconPhone, IconTikTok, IconWhatsApp } from "./icons";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" aria-label={`Accueil — ${site.name}`} className="group flex items-center gap-2.5 leading-none md:gap-3">
      <LogoEmbleme className="size-11 shrink-0 md:size-13" />
      <span className="block">
        <span className="block whitespace-nowrap font-serif text-[0.98rem] font-semibold uppercase tracking-[0.12em] min-[400px]:text-[1.08rem] md:text-[1.3rem] xl:text-[1.4rem]">
          Dame de Bijoux
        </span>
        <span
          className={`mt-1.5 flex items-center gap-2 text-[0.5rem] font-medium uppercase tracking-[0.55em] ${
            light ? "text-or-clair" : "text-or-fonce"
          }`}
        >
          <span className="h-px flex-1 bg-current opacity-60" />
          <span className="-mr-[0.55em]">World</span>
          <span className="h-px flex-1 bg-current opacity-60" />
        </span>
      </span>
    </Link>
  );
}

/** `actualites` : au moins une actualité publiée, la rubrique entre dans le menu. */
export function Header({ actualites }: { actualites: boolean }) {
  const nav = navigation(actualites);
  const pathname = usePathname();
  const cart = useCart();
  const boutique = useBoutique();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header
        className={`sticky top-0 z-40 border-b transition-[background-color,border-color,box-shadow] duration-300 ${
          scrolled
            ? "border-filet bg-ivoire/92 shadow-[0_8px_30px_-20px_rgb(21_11_17/0.35)] backdrop-blur-md"
            : "border-transparent bg-ivoire"
        }`}
      >
        <div className="conteneur flex h-16 items-center justify-between gap-4 md:h-20 xl:gap-6">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="-ml-2 grid size-11 place-items-center lg:hidden"
            aria-label="Ouvrir le menu"
            aria-expanded={menuOpen}
            aria-controls="menu-mobile"
          >
            <IconMenu />
          </button>

          <div className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0">
            <Logo />
          </div>

          <nav aria-label="Navigation principale" className="hidden items-center gap-3.5 lg:flex xl:gap-7">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className="eyebrow relative whitespace-nowrap py-2 font-times text-[0.75rem] tracking-[0.16em] transition-colors hover:text-or-fonce aria-[current=page]:text-or-fonce after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100 aria-[current=page]:after:scale-x-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 md:gap-2 min-[75rem]:gap-3">
            {/* Numéro en entier dès qu'il tient à côté du menu ; avant, une icône (sur téléphone : « Appeler » dans le menu). */}
            <a
              href={boutique.lienTelephone}
              aria-label={`Appeler le ${boutique.phone}`}
              title={boutique.phone}
              className="hidden size-10 place-items-center rounded-full border border-filet hover:border-or-fonce hover:text-or-fonce md:grid min-[75rem]:hidden"
            >
              <IconPhone width={16} height={16} />
            </a>
            <a
              href={boutique.lienTelephone}
              className="eyebrow hidden items-center gap-2 px-2 py-2 font-times text-[0.75rem] tracking-[0.16em] whitespace-nowrap hover:text-or-fonce min-[75rem]:flex"
            >
              <IconPhone width={16} height={16} />
              {boutique.phone}
            </a>
            <button
              type="button"
              onClick={cart.open}
              className="relative -mr-2 flex h-11 items-center gap-2 px-2 hover:text-or-fonce"
              aria-label={`Voir ma commande : ${cart.count} article${cart.count > 1 ? "s" : ""}`}
            >
              <IconBag width={22} height={22} />
              {/* Libellé sur tablette seulement : dès que le menu s'affiche, la place va aux liens et au numéro. */}
              <span className="eyebrow hidden font-times text-[0.75rem] tracking-[0.16em] md:inline lg:hidden">
                Commande
              </span>
              <span
                className={`prix absolute top-1 left-5 grid min-w-[1.15rem] place-items-center rounded-full bg-rubis px-1 text-[0.65rem] font-semibold leading-[1.15rem] text-white transition-transform duration-300 md:static md:ml-0.5 ${
                  cart.count > 0 ? "scale-100" : "scale-0"
                }`}
              >
                {cart.count}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Menu mobile plein écran */}
      <div
        id="menu-mobile"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!menuOpen}
        className={`fixed inset-0 z-50 flex flex-col bg-nuit text-ivoire transition-[opacity,visibility] duration-500 lg:hidden ${
          menuOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <div className="halo pointer-events-none absolute inset-0" />
        <div className="conteneur relative flex h-16 items-center justify-between">
          <Logo light />
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="-mr-2 grid size-11 place-items-center"
            aria-label="Fermer le menu"
          >
            <IconClose />
          </button>
        </div>
        <nav aria-label="Navigation mobile" className="conteneur relative mt-8 flex flex-col">
          {[{ href: "/", label: "Accueil" }, ...nav].map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              aria-current={pathname === item.href ? "page" : undefined}
              style={{ transitionDelay: menuOpen ? `${80 + i * 50}ms` : "0ms" }}
              className={`titre border-b border-ivoire/10 py-4 font-times text-4xl transition-[opacity,transform] duration-500 aria-[current=page]:text-or-clair ${
                menuOpen ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="conteneur relative mt-auto grid gap-3 pb-[max(2rem,env(safe-area-inset-bottom))]">
          <a href={greetingUrl(boutique.whatsapp)} target="_blank" rel="noopener noreferrer" className="bouton bouton-whatsapp w-full">
            <IconWhatsApp /> Écrire sur WhatsApp
          </a>
          <div className="grid grid-cols-2 gap-3">
            <a href={boutique.lienTelephone} className="bouton bouton-contour-clair">
              <IconPhone width={16} height={16} /> Appeler
            </a>
            <a href={boutique.lienTikTok} target="_blank" rel="noopener noreferrer" className="bouton bouton-contour-clair">
              <IconTikTok width={16} height={16} /> TikTok
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
