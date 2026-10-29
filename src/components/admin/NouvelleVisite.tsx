"use client";

import { useRouter } from "next/navigation";
import { Fragment, type ReactNode } from "react";

/**
 * Next.js garde les pages déjà visitées telles qu'on les a laissées. Un formulaire ouvert par un lien doit pourtant
 * repartir des données enregistrées ; seul le retour arrière du navigateur le retrouve en l'état.
 */
export function NouvelleVisite({ children }: { children: ReactNode }) {
  const { bfcacheId } = useRouter();
  return <Fragment key={bfcacheId}>{children}</Fragment>;
}
