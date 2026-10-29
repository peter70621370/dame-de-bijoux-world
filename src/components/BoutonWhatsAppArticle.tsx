"use client";

import type { Product } from "@/lib/products";
import { productEnquiryUrl } from "@/lib/whatsapp";
import { useBoutique } from "./BoutiqueProvider";
import { IconWhatsApp } from "./icons";

/** Bouton WhatsApp des cartes article : le numéro vient des coordonnées de la boutique. */
export function BoutonWhatsAppArticle({ product }: { product: Product }) {
  const { whatsapp } = useBoutique();
  return (
    <a
      href={productEnquiryUrl(whatsapp, product)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Commander ${product.name} sur WhatsApp`}
      className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#1f8f4e] text-white transition-colors hover:bg-[#187a42]"
    >
      <IconWhatsApp width={20} height={20} />
    </a>
  );
}
