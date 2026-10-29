import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { Avis, EnTete, Pastille } from "@/components/admin/ui";
import { getComptes } from "@/lib/data/admin";
import { formatDateHeure } from "@/lib/dates";
import { ROLES } from "@/lib/roles";

export const metadata: Metadata = {
  title: "Comptes",
};

export default async function ComptesPage({ searchParams }: PageProps<"/admin/comptes">) {
  const [{ ajout, suppression }, comptes] = await Promise.all([searchParams, getComptes()]);
  const ajoute = comptes.find((c) => c.id === ajout);

  return (
    <div className="space-y-6 md:space-y-8">
      <EnTete
        surtitre="Administration"
        titre="Comptes"
        description="Les personnes qui peuvent se connecter à l’espace admin."
        action={
          <Link href="/admin/comptes/nouveau" className="bouton bouton-nuit w-full sm:w-auto">
            <Plus size={16} aria-hidden /> Nouveau compte
          </Link>
        }
      />

      {ajoute && (
        <Avis>
          Le compte de {ajoute.name} est créé : transmettez-lui son adresse ({ajoute.email}) et son mot de passe de vive
          voix.
        </Avis>
      )}
      {suppression && <Avis>Le compte a été supprimé.</Avis>}

      <ul className="divide-y divide-filet overflow-hidden rounded-2xl border border-filet bg-white">
        {comptes.map((c) => (
          <li key={c.id}>
            <Link
              href={c.vous ? "/admin/mon-compte" : `/admin/comptes/${c.id}`}
              className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-sable/40 md:gap-4 md:px-5"
            >
              <span
                aria-hidden
                className="grid size-11 shrink-0 place-items-center rounded-full bg-nuit font-serif text-xl text-or-clair"
              >
                {c.name.charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="truncate font-medium">{c.name}</span>
                  <Pastille ton={c.role === "ADMIN" ? "or" : "gris"}>{ROLES[c.role].label}</Pastille>
                  {c.vous && <Pastille ton="vert">Vous</Pastille>}
                  {c.bloque && <Pastille ton="rubis">Bloqué</Pastille>}
                </span>
                <span className="mt-0.5 block truncate text-sm text-douce">{c.email}</span>
                <span className="mt-0.5 block text-xs text-douce">
                  {c.lastLoginAt ? `Dernière connexion le ${formatDateHeure(c.lastLoginAt)}` : "Jamais connecté"}
                </span>
              </span>
              <ChevronRight size={18} aria-hidden className="shrink-0 text-douce" />
            </Link>
          </li>
        ))}
      </ul>

      <p className="text-sm leading-relaxed text-douce">
        Un utilisateur gère les articles, catégories, promotions, le bandeau et les actualités ; un administrateur, tout
        l’espace admin. Après cinq mots de passe erronés d’affilée, un compte est bloqué quinze minutes. Un mot de passe
        oublié ? Un administrateur peut en donner un nouveau depuis la fiche du compte.
      </p>
    </div>
  );
}
