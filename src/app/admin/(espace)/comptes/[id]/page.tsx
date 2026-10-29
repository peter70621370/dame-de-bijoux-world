import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BoutonSupprimer } from "@/components/admin/BoutonSupprimer";
import { NouvelleVisite } from "@/components/admin/NouvelleVisite";
import { EnTete, Pastille } from "@/components/admin/ui";
import { changerMotDePasse, enregistrerProfil, reinitialiserMotDePasse, supprimerCompte } from "@/lib/actions/comptes";
import { getComptes } from "@/lib/data/admin";
import { formatDateHeure } from "@/lib/dates";
import { FormulaireMotDePasse, FormulaireProfil } from "../Formulaires";

export const metadata: Metadata = {
  title: "Compte",
};

export default async function ComptePage({ params }: PageProps<"/admin/comptes/[id]">) {
  const [{ id }, comptes] = await Promise.all([params, getComptes()]);
  const compte = comptes.find((c) => c.id === id);
  if (!compte) notFound();

  return (
    <div className="space-y-6 md:space-y-8">
      <EnTete
        retour={{ href: "/admin/comptes", label: "Comptes" }}
        surtitre={compte.vous ? "Mon compte" : "Compte"}
        titre={compte.name}
        description={
          <>
            {compte.email}
            {compte.bloque && (
              <>
                {" "}
                <Pastille ton="rubis">Bloqué</Pastille>
              </>
            )}
          </>
        }
      />

      <NouvelleVisite>
        <div className="mx-auto max-w-3xl space-y-5">
          {compte.vous ? (
            <>
              <FormulaireProfil nom={compte.name} email={compte.email} action={enregistrerProfil} />
              <FormulaireMotDePasse
                avecActuel
                titre="Changer mon mot de passe"
                description="Vos autres appareils seront déconnectés ; celui-ci reste connecté."
                action={changerMotDePasse}
              />
            </>
          ) : (
            <>
              <p className="text-sm leading-relaxed text-douce">
                {compte.lastLoginAt
                  ? `Dernière connexion le ${formatDateHeure(compte.lastLoginAt)}.`
                  : "Ce compte ne s’est encore jamais connecté."}{" "}
                Son nom et son adresse se modifient depuis son propre compte.
              </p>
              <FormulaireMotDePasse
                avecActuel={false}
                titre="Nouveau mot de passe"
                description={`Si ${compte.name} a oublié son mot de passe${compte.bloque ? " ou pour débloquer le compte tout de suite" : ""} : ses appareils seront déconnectés, transmettez-lui le nouveau de vive voix.`}
                action={reinitialiserMotDePasse.bind(null, compte.id)}
              />
            </>
          )}
        </div>
      </NouvelleVisite>

      <section className="mx-auto max-w-3xl border-t border-filet pt-6">
        {compte.vous ? (
          <p className="text-sm leading-relaxed text-douce">
            Votre propre compte ne peut pas être supprimé d’ici : l’autre compte peut le faire depuis le sien.
          </p>
        ) : comptes.length > 1 ? (
          <BoutonSupprimer
            action={supprimerCompte.bind(null, compte.id)}
            libelle="Supprimer le compte"
            titre="Supprimer ce compte ?"
            message={`${compte.name} ne pourra plus se connecter au back-office. C’est définitif.`}
          />
        ) : null}
      </section>
    </div>
  );
}
