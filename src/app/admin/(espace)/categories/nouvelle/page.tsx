import type { Metadata } from "next";
import { NouvelleVisite } from "@/components/admin/NouvelleVisite";
import { EnTete } from "@/components/admin/ui";
import { enregistrerCategorie } from "@/lib/actions/categories";
import { verifySession } from "@/lib/dal";
import { FormulaireCategorie } from "../FormulaireCategorie";

export const metadata: Metadata = {
  title: "Nouvelle catégorie",
};

export default async function NouvelleCategoriePage() {
  await verifySession();

  return (
    <div className="space-y-6 md:space-y-8">
      <EnTete centre retour={{ href: "/admin/categories", label: "Catégories" }} surtitre="Catalogue" titre="Nouvelle catégorie" />
      <NouvelleVisite>
        <FormulaireCategorie
          nouvelle
          action={enregistrerCategorie.bind(null, null)}
          categorie={{ label: "", tag: "", blurb: "", onRequest: false, image: "" }}
        />
      </NouvelleVisite>
    </div>
  );
}
