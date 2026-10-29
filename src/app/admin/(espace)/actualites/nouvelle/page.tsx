import type { Metadata } from "next";
import { NouvelleVisite } from "@/components/admin/NouvelleVisite";
import { EnTete } from "@/components/admin/ui";
import { enregistrerActualite } from "@/lib/actions/actualites";
import { getChoixArticles } from "@/lib/data/admin";
import { aujourdhui } from "@/lib/dates";
import { FormulaireActualite } from "../FormulaireActualite";

export const metadata: Metadata = {
  title: "Nouvelle actualité",
};

export default async function NouvelleActualitePage() {
  const articles = await getChoixArticles();
  const jour = aujourdhui();

  return (
    <div className="space-y-6 md:space-y-8">
      <EnTete centre retour={{ href: "/admin/actualites", label: "Actualités" }} surtitre="Annonces" titre="Nouvelle actualité" />
      <NouvelleVisite>
        <FormulaireActualite
          nouvelle
          articles={articles}
          aujourdhui={jour}
          action={enregistrerActualite.bind(null, null)}
          actualite={{
            title: "",
            excerpt: "",
            body: "",
            image: "",
            published: true,
            publishedAt: jour,
            articles: [],
            version: "",
          }}
        />
      </NouvelleVisite>
    </div>
  );
}
