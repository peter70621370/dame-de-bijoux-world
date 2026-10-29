import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Newspaper, Plus } from "lucide-react";
import { BasculeEnLigne } from "@/components/admin/BasculeEnLigne";
import { Avis, EnTete } from "@/components/admin/ui";
import { basculerActualite } from "@/lib/actions/actualites";
import { getActualites } from "@/lib/data/admin";
import { formatDate } from "@/lib/dates";

export const metadata: Metadata = {
  title: "Actualités",
};

export default async function ActualitesPage({ searchParams }: PageProps<"/admin/actualites">) {
  const [{ ajout, suppression }, actualites] = await Promise.all([searchParams, getActualites()]);
  const ajoutee = actualites.find((a) => a.id === ajout);

  return (
    <div className="space-y-6 md:space-y-8">
      <EnTete
        surtitre="Annonces"
        titre="Actualités"
        description="Arrivages, nouveautés, événements : publiés sur la page Actualités du site, les trois derniers aussi sur l’accueil."
        action={
          <Link href="/admin/actualites/nouvelle" className="bouton bouton-nuit w-full sm:w-auto">
            <Plus size={16} aria-hidden /> Nouvelle actualité
          </Link>
        }
      />

      {ajoutee && (
        <Avis>
          L’actualité « {ajoutee.title} » est enregistrée
          {ajoutee.published ? (
            <>
              {" "}et publiée sur le site.{" "}
              <a href={`/actualites/${ajoutee.slug}`} target="_blank" rel="noopener noreferrer" className="underline">
                La voir
              </a>
            </>
          ) : (
            " en brouillon : elle n’est pas encore sur le site."
          )}
        </Avis>
      )}
      {suppression && <Avis>L’actualité a été supprimée.</Avis>}

      {actualites.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-filet px-5 py-12 text-center">
          <Newspaper size={28} aria-hidden className="mx-auto text-or-fonce" />
          <p className="mt-3 font-serif text-2xl">Aucune actualité pour l’instant</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-douce">
            Annoncez un arrivage avec sa photo et les articles concernés : la rubrique Actualités apparaît dans le menu
            du site dès la première publiée.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-filet overflow-hidden rounded-2xl border border-filet bg-white">
          {actualites.map((a) => (
            <li key={a.id} className="flex items-center gap-2 py-3 pr-3 pl-3 md:gap-4 md:px-5">
              <Link href={`/admin/actualites/${a.id}`} className="flex min-w-0 flex-1 items-center gap-3 rounded-xl md:gap-4">
                <span className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-sable text-douce">
                  {a.image ? (
                    <Image src={a.image} alt="" fill sizes="64px" className="object-cover" />
                  ) : (
                    <Newspaper size={20} aria-hidden />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{a.title}</span>
                  <span className="mt-0.5 block truncate text-sm text-douce">
                    {formatDate(a.publishedAt)}
                    {a.articles > 0 && ` · ${a.articles} article${a.articles > 1 ? "s" : ""}`}
                  </span>
                </span>
              </Link>
              <BasculeEnLigne
                etiquette={`« ${a.title} » en ligne`}
                enLigne={a.published}
                action={basculerActualite.bind(null, a.id)}
                libelles={["En ligne", "Brouillon"]}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
