import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Megaphone, PanelTop, Pencil } from "lucide-react";
import { BandeauAnnonce } from "@/components/BandeauAnnonce";
import { BasculeEnLigne } from "@/components/admin/BasculeEnLigne";
import { EnTete, Pastille } from "@/components/admin/ui";
import { basculerAnnonce } from "@/lib/actions/annonces";
import { etatAnnonce, versBandeau, versFenetre, type TypeAnnonce } from "@/lib/annonces";
import { getAnnonces } from "@/lib/data/admin";
import { formatJour } from "@/lib/dates";

export const metadata: Metadata = {
  title: "Bandeau & fenêtre",
};

type Annonce = NonNullable<Awaited<ReturnType<typeof getAnnonces>>["bandeau"]>;

const PRESENTATION = {
  bandeau: {
    titre: "Bandeau en haut du site",
    description: "Une ligne au-dessus du menu, sur toutes les pages.",
    icone: PanelTop,
    /** Accord des participes : « désactivé », « désactivée ». */
    e: "",
  },
  fenetre: {
    titre: "Fenêtre à l’ouverture",
    description: "S’ouvre une fois par visiteur, un instant après son arrivée sur le site.",
    icone: Megaphone,
    e: "e",
  },
};

export default async function AnnoncesPage() {
  const { bandeau, fenetre } = await getAnnonces();

  return (
    <div className="space-y-6 md:space-y-8">
      <EnTete
        surtitre="Annonces"
        titre="Bandeau & fenêtre"
        description="Pour prévenir les visiteurs d’un arrivage, d’une promotion ou d’une fermeture exceptionnelle."
      />
      {/* Cartes de même hauteur, boutons alignés en bas. */}
      <div className="grid gap-5 lg:grid-cols-2">
        <CarteAnnonce type="bandeau" annonce={bandeau} />
        <CarteAnnonce type="fenetre" annonce={fenetre} />
      </div>
    </div>
  );
}

function CarteAnnonce({ type, annonce }: { type: TypeAnnonce; annonce: Annonce | null }) {
  const { titre, description, icone: Icone, e } = PRESENTATION[type];
  const bandeau = type === "bandeau";
  // Rédigée : de quoi s'afficher sur le site (le message du bandeau, le titre de la fenêtre).
  const redigee = annonce && (bandeau ? annonce.text : annonce.title) ? annonce : null;
  const etat = redigee && etatAnnonce(redigee);

  return (
    <section className="flex flex-col overflow-hidden rounded-2xl border border-filet bg-white">
      <div className="flex items-start gap-3 p-5 md:gap-4 md:p-6">
        <span className="hidden size-11 shrink-0 place-items-center rounded-xl bg-sable text-or-fonce sm:grid">
          <Icone size={20} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-serif text-2xl leading-tight">{titre}</h2>
          <p className="mt-1 text-sm leading-snug text-douce">{description}</p>
          <p className="mt-2.5 flex flex-wrap gap-1.5">
            {!redigee || !etat ? (
              <Pastille ton="gris">Pas encore rédigé{e}</Pastille>
            ) : etat === "en-ligne" ? (
              <>
                <Pastille ton="vert">Sur le site</Pastille>
                {redigee.endsAt && <Pastille ton="gris">Jusqu’au {formatJour(redigee.endsAt)}</Pastille>}
              </>
            ) : etat === "programmee" && redigee.startsAt ? (
              <Pastille ton="or">
                Programmé{e} à partir du {formatJour(redigee.startsAt)}
              </Pastille>
            ) : etat === "terminee" && redigee.endsAt ? (
              <Pastille ton="gris">
                Terminé{e} le {formatJour(redigee.endsAt)}
              </Pastille>
            ) : (
              <Pastille ton="gris">Désactivé{e}</Pastille>
            )}
          </p>
        </div>
        {redigee && (
          <BasculeEnLigne
            etiquette={bandeau ? "Bandeau activé" : "Fenêtre activée"}
            enLigne={etat === "en-ligne" || etat === "programmee"}
            action={basculerAnnonce.bind(null, type)}
            libelles={[`Activé${e}`, `Désactivé${e}`]}
          />
        )}
      </div>

      {redigee && (
        <div inert className="border-t border-filet bg-sable/40 p-5 md:p-6">
          {bandeau ? (
            <div className="overflow-hidden rounded-xl">
              <BandeauAnnonce bandeau={versBandeau(redigee)} apercu />
            </div>
          ) : (
            <ApercuFenetre annonce={redigee} />
          )}
        </div>
      )}

      <div className="mt-auto flex flex-wrap gap-2 border-t border-filet p-4 md:px-6">
        {/* Largeur naturelle : sur téléphone, le second bouton passe à la ligne plutôt que de couper son texte. */}
        <Link href={`/admin/annonces/${type}`} className="bouton bouton-nuit flex-auto sm:flex-none">
          <Pencil size={16} aria-hidden /> {redigee ? "Modifier" : "Rédiger"}
        </Link>
        {etat === "en-ligne" && (
          <a
            href={bandeau ? "/" : "/?apercu=fenetre"}
            target="_blank"
            rel="noopener noreferrer"
            className="bouton bouton-contour flex-auto sm:flex-none"
          >
            <ExternalLink size={16} aria-hidden /> Voir sur le site
          </a>
        )}
      </div>
    </section>
  );
}

/** Fenêtre résumée : photo, titre, début du texte et bouton. */
function ApercuFenetre({ annonce }: { annonce: Annonce }) {
  const { titre, texte, image, lien } = versFenetre(annonce);
  return (
    <div className="flex gap-4">
      {image && (
        <span className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-sable">
          <Image src={image} alt="" fill sizes="80px" className="object-cover" />
        </span>
      )}
      <div className="min-w-0 text-sm">
        <p className="font-serif text-xl leading-tight break-words">{titre}</p>
        {texte && <p className="mt-1 line-clamp-2 text-douce">{texte}</p>}
        <p className="mt-2 text-xs text-douce">
          {lien ? (
            <>
              Bouton : <span className="font-medium text-encre">{lien.label}</span>
            </>
          ) : (
            "Sans bouton"
          )}
        </p>
      </div>
    </div>
  );
}
