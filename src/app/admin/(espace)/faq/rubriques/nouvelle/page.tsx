import type { Metadata } from "next";
import { NouvelleVisite } from "@/components/admin/NouvelleVisite";
import { EnTete } from "@/components/admin/ui";
import { enregistrerRubrique } from "@/lib/actions/faq";
import { verifySession } from "@/lib/dal";
import { FormulaireRubrique } from "../FormulaireRubrique";

export const metadata: Metadata = {
  title: "Nouvelle rubrique",
};

export default async function NouvelleRubriquePage() {
  await verifySession();

  return (
    <div className="space-y-6 md:space-y-8">
      <EnTete retour={{ href: "/admin/faq", label: "FAQ" }} surtitre="FAQ" titre="Nouvelle rubrique" />
      <NouvelleVisite>
        <FormulaireRubrique nouvelle titre="" version="" action={enregistrerRubrique.bind(null, null)} />
      </NouvelleVisite>
    </div>
  );
}
