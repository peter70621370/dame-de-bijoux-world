import type { Metadata } from "next";
import { NouvelleVisite } from "@/components/admin/NouvelleVisite";
import { EnTete } from "@/components/admin/ui";
import { changerMotDePasse, enregistrerProfil } from "@/lib/actions/comptes";
import { verifySession } from "@/lib/dal";
import { ROLES } from "@/lib/roles";
import { FormulaireMotDePasse, FormulaireProfil } from "../comptes/Formulaires";

export const metadata: Metadata = {
  title: "Mon compte",
};

// Ouvert à tous les rôles : chacun gère son nom, son adresse et son mot de passe.
export default async function MonComptePage() {
  const admin = await verifySession();

  return (
    <div className="space-y-6 md:space-y-8">
      <EnTete centre surtitre="Mon compte" titre={admin.name} description={admin.email} />

      <NouvelleVisite>
        <div className="mx-auto max-w-3xl space-y-5">
          <p className="text-sm leading-relaxed text-douce">
            Rôle : <span className="font-medium text-encre">{ROLES[admin.role].label}</span>.{" "}
            {ROLES[admin.role].description}
          </p>
          <FormulaireProfil nom={admin.name} email={admin.email} action={enregistrerProfil} />
          <FormulaireMotDePasse
            avecActuel
            titre="Changer mon mot de passe"
            description="Vos autres appareils seront déconnectés ; celui-ci reste connecté."
            action={changerMotDePasse}
          />
        </div>
      </NouvelleVisite>

      <p className="mx-auto max-w-3xl border-t border-filet pt-6 text-sm leading-relaxed text-douce">
        Votre propre compte ne peut pas être supprimé d’ici : un autre administrateur peut le faire depuis sa fiche.
      </p>
    </div>
  );
}
