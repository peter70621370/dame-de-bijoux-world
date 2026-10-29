import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, CircleCheck } from "lucide-react";

// Éléments communs aux pages du back-office.

/** Champ de saisie : 16 px de texte, sinon les téléphones zooment sur le champ au toucher. */
export const styleChamp =
  "block w-full rounded-xl border border-filet bg-white px-3.5 py-3 text-base text-encre placeholder:text-douce/60 transition-colors focus:border-or focus:outline-none focus:ring-2 focus:ring-or/30 aria-invalid:border-rubis";

/** Relie un champ à son message d'erreur, pour les lecteurs d'écran. */
export function propsErreur(id: string, erreur?: string) {
  return erreur ? { "aria-invalid": true, "aria-describedby": `${id}-erreur` } : {};
}

export function EnTete({
  surtitre,
  titre,
  description,
  retour,
  action,
}: {
  surtitre?: string;
  titre: string;
  description?: ReactNode;
  retour?: { href: string; label: string };
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="min-w-0">
        {retour && (
          <Link
            href={retour.href}
            className="mb-4 flex w-fit items-center gap-1.5 text-sm text-douce transition-colors hover:text-encre"
          >
            <ArrowLeft size={16} aria-hidden /> {retour.label}
          </Link>
        )}
        {surtitre && <p className="eyebrow text-or-fonce">{surtitre}</p>}
        <h1 className={`titre text-[2.4rem] break-words md:text-5xl ${surtitre ? "mt-3" : ""}`}>{titre}</h1>
        {description && <p className="mt-2 text-douce">{description}</p>}
      </div>
      {action}
    </header>
  );
}

export function Carte({
  titre,
  description,
  id,
  children,
}: {
  titre: string;
  description?: ReactNode;
  id?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl border border-filet bg-white p-5 md:p-7">
      <h2 className="font-serif text-2xl">{titre}</h2>
      {description && <p className="mt-1 text-sm leading-relaxed text-douce">{description}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

export function Champ({
  id,
  label,
  aide,
  erreur,
  children,
}: {
  id: string;
  label: string;
  aide?: string;
  erreur?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      {aide && <p className="mt-0.5 text-[0.8rem] leading-snug text-douce">{aide}</p>}
      <div className="mt-2">{children}</div>
      {erreur && (
        <p id={`${id}-erreur`} className="mt-1.5 text-sm text-rubis">
          {erreur}
        </p>
      )}
    </div>
  );
}

/** Case à cocher présentée en interrupteur ; elle reste un vrai champ du formulaire. */
export function Interrupteur({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string;
  label: string;
  description?: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-5">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {description && <span className="mt-0.5 block text-[0.8rem] leading-snug text-douce">{description}</span>}
      </span>
      <input type="checkbox" role="switch" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
      <span
        aria-hidden
        className="relative mt-0.5 h-7 w-12 shrink-0 rounded-full bg-encre/15 transition-colors after:absolute after:top-1 after:left-1 after:size-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:bg-[#1f8f4e] peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-or peer-focus-visible:ring-offset-2"
      />
    </label>
  );
}

const TONS = {
  vert: "bg-[#1f8f4e]/10 text-[#187a42]",
  gris: "bg-encre/8 text-douce",
  rubis: "bg-rubis/10 text-rubis",
  or: "bg-or/20 text-or-fonce",
};

export function Pastille({ ton, children }: { ton: keyof typeof TONS; children: ReactNode }) {
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${TONS[ton]}`}>{children}</span>;
}

/** Confirmation affichée après une action (article ajouté, supprimé…). */
export function Avis({ children }: { children: ReactNode }) {
  return (
    <p
      role="status"
      className="flex items-start gap-3 rounded-2xl border border-[#1f8f4e]/25 bg-[#1f8f4e]/8 px-4 py-3 text-sm text-[#187a42]"
    >
      <CircleCheck size={18} aria-hidden className="mt-px shrink-0" />
      <span>{children}</span>
    </p>
  );
}
