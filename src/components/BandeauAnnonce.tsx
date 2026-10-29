import Link from "next/link";
import type { ReactNode } from "react";
import { estLienExterne, TONS_BANDEAU, type Bandeau, type Lien } from "@/lib/annonces";
import { IconArrow } from "./icons";

/**
 * Bandeau d'annonce au-dessus de l'en-tête, sur toutes les pages ; il défile avec la page, l'en-tête reste collé en haut.
 * `apercu` : rendu du back-office, où le lien ne mène nulle part.
 */
export function BandeauAnnonce({ bandeau, apercu = false }: { bandeau: Bandeau; apercu?: boolean }) {
  const { texte, ton, lien } = bandeau;
  return (
    <aside aria-label="Annonce" className={TONS_BANDEAU[ton].classes}>
      {/* Le lien suit le texte sur la même ligne tant qu'il y a la place : deux lignes au plus sur téléphone. */}
      <p className="conteneur py-2 text-center text-[0.82rem] leading-snug md:py-2.5">
        {texte}
        {lien && (
          <>
            {" "}
            <LienAnnonce
              lien={lien}
              apercu={apercu}
              className={`ml-1.5 inline-flex items-center gap-1.5 align-bottom font-medium whitespace-nowrap underline underline-offset-4 hover:no-underline ${TONS_BANDEAU[ton].lien}`}
            >
              {lien.label} <IconArrow width={14} height={14} />
            </LienAnnonce>
          </>
        )}
      </p>
    </aside>
  );
}

/** Lien d'une annonce : page du site, ou adresse extérieure (WhatsApp, TikTok…) ouverte dans un nouvel onglet. */
export function LienAnnonce({
  lien,
  apercu = false,
  className,
  onClick,
  children,
}: {
  lien: Lien;
  apercu?: boolean;
  className: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  if (apercu) return <span className={className}>{children}</span>;
  if (estLienExterne(lien.url)) {
    return (
      <a href={lien.url} target="_blank" rel="noopener noreferrer" onClick={onClick} className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={lien.url} onClick={onClick} className={className}>
      {children}
    </Link>
  );
}
