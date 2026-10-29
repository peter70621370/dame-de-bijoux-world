import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BoutonSupprimer } from "@/components/admin/BoutonSupprimer";
import { NouvelleVisite } from "@/components/admin/NouvelleVisite";
import { EnTete } from "@/components/admin/ui";
import { enregistrerRubrique, supprimerRubrique } from "@/lib/actions/faq";
import { getRubrique } from "@/lib/data/admin";
import { FormulaireRubrique } from "../FormulaireRubrique";

export const metadata: Metadata = {
  title: "Modifier une rubrique",
};

export default async function RubriquePage({ params }: PageProps<"/admin/faq/rubriques/[id]">) {
  const { id } = await params;
  const rubrique = await getRubrique(id);
  if (!rubrique) notFound();

  const questions = rubrique._count.questions;

  return (
    <div className="space-y-6 md:space-y-8">
      <EnTete centre retour={{ href: "/admin/faq", label: "FAQ" }} surtitre="Rubrique" titre={rubrique.title} />

      <NouvelleVisite>
        <FormulaireRubrique
          nouvelle={false}
          titre={rubrique.title}
          version={rubrique.updatedAt.toISOString()}
          action={enregistrerRubrique.bind(null, rubrique.id)}
        />
      </NouvelleVisite>

      <section className="mx-auto max-w-3xl border-t border-filet pt-6">
        {questions > 0 ? (
          <p className="text-sm leading-relaxed text-douce">
            Pour supprimer cette rubrique, rangez d’abord {questions > 1 ? `ses ${questions} questions` : "sa question"}{" "}
            dans une autre rubrique, ou {questions > 1 ? "supprimez-les" : "supprimez-la"}.
          </p>
        ) : (
          <BoutonSupprimer
            action={supprimerRubrique.bind(null, rubrique.id)}
            libelle="Supprimer la rubrique"
            titre="Supprimer cette rubrique ?"
            message={`« ${rubrique.title} » ne contient aucune question. Elle sera effacée.`}
          />
        )}
      </section>
    </div>
  );
}
