import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BoutonSupprimer } from "@/components/admin/BoutonSupprimer";
import { NouvelleVisite } from "@/components/admin/NouvelleVisite";
import { EnTete } from "@/components/admin/ui";
import { enregistrerQuestion, supprimerQuestion } from "@/lib/actions/faq";
import { getChoixRubriques, getQuestion, getQuestionsSurAccueil } from "@/lib/data/admin";
import { FormulaireQuestion } from "../FormulaireQuestion";

export const metadata: Metadata = {
  title: "Modifier une question",
};

export default async function QuestionPage({ params }: PageProps<"/admin/faq/[id]">) {
  const { id } = await params;
  const [question, rubriques, surAccueil] = await Promise.all([
    getQuestion(id),
    getChoixRubriques(),
    getQuestionsSurAccueil(id),
  ]);
  if (!question) notFound();

  return (
    <div className="space-y-6 md:space-y-8">
      <EnTete
        retour={{ href: "/admin/faq", label: "FAQ" }}
        surtitre={rubriques.find((r) => r.id === question.sectionId)?.title ?? "FAQ"}
        titre={question.question}
      />

      <NouvelleVisite>
        <FormulaireQuestion
          nouvelle={false}
          rubriques={rubriques}
          surAccueil={surAccueil.map((q) => q.question)}
          action={enregistrerQuestion.bind(null, question.id)}
          question={{
            sectionId: question.sectionId,
            question: question.question,
            answer: question.answer,
            onHome: question.onHome,
            version: question.updatedAt.toISOString(),
          }}
        />
      </NouvelleVisite>

      <section className="mx-auto max-w-3xl border-t border-filet pt-6">
        <BoutonSupprimer
          action={supprimerQuestion.bind(null, question.id)}
          libelle="Supprimer la question"
          titre="Supprimer cette question ?"
          message={`« ${question.question} » sera effacée de la FAQ${question.onHome ? " et de l’accueil" : ""}. C’est définitif.`}
        />
      </section>
    </div>
  );
}
