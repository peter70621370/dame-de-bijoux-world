"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

/** Bouton qui lance une action réversible sans demander confirmation, et l'indique pendant l'envoi. */
export function BoutonAction({
  action,
  enCours,
  className,
  children,
}: {
  action: () => Promise<void>;
  /** Libellé pendant l'envoi, par exemple « Arrêt… ». */
  enCours: string;
  className: string;
  children: ReactNode;
}) {
  return (
    <form action={action}>
      <Envoyer enCours={enCours} className={className}>
        {children}
      </Envoyer>
    </form>
  );
}

function Envoyer({ enCours, className, children }: { enCours: string; className: string; children: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? enCours : children}
    </button>
  );
}
