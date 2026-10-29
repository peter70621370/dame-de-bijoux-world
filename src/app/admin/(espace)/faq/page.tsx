import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Plus } from "lucide-react";
import { Avis, EnTete } from "@/components/admin/ui";
import { getFaqAdmin } from "@/lib/data/admin";
import { ListeFaq } from "./ListeFaq";

export const metadata: Metadata = {
  title: "FAQ",
};

export default async function FaqPage({ searchParams }: PageProps<"/admin/faq">) {
  const [{ ajout, rubrique, suppression }, rubriques] = await Promise.all([searchParams, getFaqAdmin()]);
  const questionAjoutee = rubriques.flatMap((r) => r.questions).find((q) => q.id === ajout);
  const rubriqueAjoutee = rubriques.find((r) => r.id === rubrique);

  return (
    <div className="space-y-6 md:space-y-8">
      <EnTete
        surtitre="Site"
        titre="FAQ"
        description="Dans l’ordre de la page FAQ. Trois questions au plus sont aussi reprises sur l’accueil."
        action={
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <Link href="/admin/faq/rubriques/nouvelle" className="bouton bouton-contour flex-auto sm:flex-none">
              <Plus size={16} aria-hidden /> Rubrique
            </Link>
            {rubriques.length > 0 && (
              <Link href="/admin/faq/nouvelle" className="bouton bouton-nuit flex-auto sm:flex-none">
                <Plus size={16} aria-hidden /> Question
              </Link>
            )}
          </div>
        }
      />

      {questionAjoutee && <Avis>La question est ajoutée, à la fin de sa rubrique.</Avis>}
      {rubriqueAjoutee && (
        <Avis>
          La rubrique « {rubriqueAjoutee.title} » est créée, à la fin de la liste.{" "}
          <Link href={`/admin/faq/nouvelle?rubrique=${rubriqueAjoutee.id}`} className="underline">
            Ajouter une question
          </Link>
        </Avis>
      )}
      {suppression === "question" && <Avis>La question a été supprimée.</Avis>}
      {suppression === "rubrique" && <Avis>La rubrique a été supprimée.</Avis>}

      <ListeFaq rubriques={rubriques} />

      <a
        href="/faq"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 items-center gap-1.5 text-sm text-douce transition-colors hover:text-encre"
      >
        Voir la page FAQ du site <ExternalLink size={14} aria-hidden />
      </a>
    </div>
  );
}
