import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { NouvelleVisite } from "@/components/admin/NouvelleVisite";
import { EnTete } from "@/components/admin/ui";
import { enregistrerAccueil } from "@/lib/actions/accueil";
import { getAccueilAdmin, getChoixArticles } from "@/lib/data/admin";
import { FormulaireAccueil } from "./FormulaireAccueil";

export const metadata: Metadata = {
  title: "Page d’accueil",
};

export default async function AccueilPage() {
  const [{ contenu, featuredId, version }, articles] = await Promise.all([getAccueilAdmin(), getChoixArticles()]);

  return (
    <div className="space-y-6 md:space-y-8">
      <EnTete
        surtitre="Site"
        titre="Page d’accueil"
        description="Titre, photos et bloc « Vente en gros »."
        action={
          <a href="/" target="_blank" rel="noopener noreferrer" className="bouton bouton-contour w-full sm:w-auto">
            <ExternalLink size={16} aria-hidden /> Voir l’accueil
          </a>
        }
      />
      <NouvelleVisite>
        <FormulaireAccueil
          contenu={contenu}
          featuredId={featuredId}
          version={version}
          articles={articles}
          action={enregistrerAccueil}
        />
      </NouvelleVisite>
    </div>
  );
}
