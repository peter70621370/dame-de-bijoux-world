import type { Metadata } from "next";
import { NouvelleVisite } from "@/components/admin/NouvelleVisite";
import { EnTete } from "@/components/admin/ui";
import { creerCompte } from "@/lib/actions/comptes";
import { verifySession } from "@/lib/dal";
import { FormulaireNouveauCompte } from "../Formulaires";

export const metadata: Metadata = {
  title: "Nouveau compte",
};

export default async function NouveauComptePage() {
  await verifySession();

  return (
    <div className="space-y-6 md:space-y-8">
      <EnTete retour={{ href: "/admin/comptes", label: "Comptes" }} surtitre="Administration" titre="Nouveau compte" />
      <NouvelleVisite>
        <FormulaireNouveauCompte action={creerCompte} />
      </NouvelleVisite>
    </div>
  );
}
