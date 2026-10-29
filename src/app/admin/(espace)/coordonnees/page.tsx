import type { Metadata } from "next";
import { NouvelleVisite } from "@/components/admin/NouvelleVisite";
import { EnTete } from "@/components/admin/ui";
import { enregistrerCoordonnees } from "@/lib/actions/coordonnees";
import { getCoordonnees } from "@/lib/data/admin";
import { FormulaireCoordonnees } from "./FormulaireCoordonnees";

export const metadata: Metadata = {
  title: "Coordonnées",
};

export default async function CoordonneesPage() {
  const { reglages, version } = await getCoordonnees();

  return (
    <div className="space-y-6 md:space-y-8">
      <EnTete
        centre
        surtitre="Site"
        titre="Coordonnées"
        description="Téléphone, WhatsApp, adresse et horaires, partout sur le site."
      />
      <NouvelleVisite>
        <FormulaireCoordonnees reglages={reglages} version={version} action={enregistrerCoordonnees} />
      </NouvelleVisite>
    </div>
  );
}
