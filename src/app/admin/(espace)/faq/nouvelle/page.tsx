import type { Metadata } from "next";
import { redirect, RedirectType } from "next/navigation";
import { NouvelleVisite } from "@/components/admin/NouvelleVisite";
import { EnTete } from "@/components/admin/ui";
import { enregistrerQuestion } from "@/lib/actions/faq";
import { getChoixRubriques, getQuestionsSurAccueil } from "@/lib/data/admin";
import { FormulaireQuestion } from "../FormulaireQuestion";

export const metadata: Metadata = {
  title: "Nouvelle question",
};

export default async function NouvelleQuestionPage({ searchParams }: PageProps<"/admin/faq/nouvelle">) {
  const [{ rubrique }, rubriques, surAccueil] = await Promise.all([
    searchParams,
    getChoixRubriques(),
    getQuestionsSurAccueil(),
  ]);
  // Une question se range dans une rubrique : sans rubrique, on commence par en créer une.
  if (rubriques.length === 0) redirect("/admin/faq/rubriques/nouvelle", RedirectType.replace);
  const choisie = rubriques.find((r) => r.id === rubrique) ?? rubriques[0];

  return (
    <div className="space-y-6 md:space-y-8">
      <EnTete centre retour={{ href: "/admin/faq", label: "FAQ" }} surtitre="FAQ" titre="Nouvelle question" />
      <NouvelleVisite>
        <FormulaireQuestion
          nouvelle
          rubriques={rubriques}
          surAccueil={surAccueil.map((q) => q.question)}
          action={enregistrerQuestion.bind(null, null)}
          question={{ sectionId: choisie.id, question: "", answer: "", onHome: false, version: "" }}
        />
      </NouvelleVisite>
    </div>
  );
}
