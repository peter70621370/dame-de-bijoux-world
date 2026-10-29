"use client";

import { formatPrice } from "@/lib/products";
import { greetingUrl } from "@/lib/whatsapp";
import { useBoutique } from "./BoutiqueProvider";
import { useCart } from "./cart/CartProvider";
import { IconBag, IconWhatsApp } from "./icons";

/** Bouton WhatsApp permanent + rappel de commande en cours (surtout utile sur mobile). */
export function FloatingActions() {
  const cart = useCart();
  const boutique = useBoutique();
  const hasItems = cart.count > 0;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex items-end justify-end gap-3 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:p-6">
      <button
        type="button"
        onClick={cart.open}
        tabIndex={hasItems ? 0 : -1}
        aria-hidden={!hasItems}
        className={`pointer-events-auto flex h-14 flex-1 items-center justify-between gap-3 rounded-2xl bg-nuit pr-5 pl-4 text-ivoire shadow-2xl shadow-nuit/30 transition-all duration-500 ease-[var(--ease-luxe)] md:hidden ${
          hasItems ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-24 opacity-0"
        }`}
      >
        <span className="flex items-center gap-3">
          <span className="relative">
            <IconBag width={22} height={22} />
            <span className="prix absolute -top-1.5 -right-2 grid min-w-[1.1rem] place-items-center rounded-full bg-rubis px-1 text-[0.62rem] font-semibold leading-[1.1rem]">
              {cart.count}
            </span>
          </span>
          <span className="eyebrow">Ma commande</span>
        </span>
        <span className="prix text-sm text-or-clair">{formatPrice(cart.total)}</span>
      </button>

      <a
        href={greetingUrl(boutique.whatsapp)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Nous écrire sur WhatsApp"
        className="pointer-events-auto grid size-14 shrink-0 place-items-center rounded-full bg-[#1f8f4e] text-white shadow-2xl shadow-[#1f8f4e]/40 transition-transform duration-300 hover:scale-105"
      >
        <IconWhatsApp width={28} height={28} />
      </a>
    </div>
  );
}
