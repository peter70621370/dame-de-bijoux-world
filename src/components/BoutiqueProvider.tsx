"use client";

import { createContext, use, type ReactNode } from "react";
import type { Boutique } from "@/lib/boutique";

// Coordonnées de la boutique pour les composants du navigateur (en-tête, panier, formulaires…) :
// lues une fois dans la base par SiteChrome, puis transmises ici.
const ContexteBoutique = createContext<Boutique | null>(null);

export function BoutiqueProvider({ boutique, children }: { boutique: Boutique; children: ReactNode }) {
  return <ContexteBoutique value={boutique}>{children}</ContexteBoutique>;
}

export function useBoutique() {
  const boutique = use(ContexteBoutique);
  if (!boutique) throw new Error("useBoutique doit être utilisé sous <BoutiqueProvider>.");
  return boutique;
}
