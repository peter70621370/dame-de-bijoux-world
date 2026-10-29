import type { Metadata } from "next";
import { notFound, redirect, RedirectType } from "next/navigation";
import { BoutonSupprimer } from "@/components/admin/BoutonSupprimer";
import { NouvelleVisite } from "@/components/admin/NouvelleVisite";
import { EnTete, Pastille } from "@/components/admin/ui";
import { changerRole, reinitialiserMotDePasse, supprimerCompte } from "@/lib/actions/comptes";
import { getComptes } from "@/lib/data/admin";
import { formatDateHeure } from "@/lib/dates";
import { ROLES } from "@/lib/roles";
import { FormulaireMotDePasse, FormulaireRole } from "../Formulaires";

export const metadata: Metadata = {
  title: "Compte",
};

// Fiche d'un autre compte, pour les administrateurs : son propre compte se gère dans « Mon compte ».
export default async function ComptePage({ params }: PageProps<"/admin/comptes/[id]">) {
  const [{ id }, comptes] = await Promise.all([params, getComptes()]);
  const compte = comptes.find((c) => c.id === id);
  if (!compte) notFound();
  if (compte.vous) redirect("/admin/mon-compte", RedirectType.replace);

  return (
    <div className="space-y-6 md:space-y-8">
      <EnTete
        centre
        retour={{ href: "/admin/comptes", label: "Comptes" }}
        surtitre={ROLES[compte.role].label}
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
          <p className="text-sm leading-relaxed text-douce">
            {compte.lastLoginAt
              ? `Dernière connexion le ${formatDateHeure(compte.lastLoginAt)}.`
              : "Ce compte ne s’est encore jamais connecté."}{" "}
            Son nom et son adresse se modifient depuis son propre compte.
          </p>
          <FormulaireRole nom={compte.name} role={compte.role} action={changerRole.bind(null, compte.id)} />
          <FormulaireMotDePasse
            avecActuel={false}
            titre="Nouveau mot de passe"
            description={`Si ${compte.name} a oublié son mot de passe${compte.bloque ? " ou pour débloquer le compte tout de suite" : ""} : ses appareils seront déconnectés, transmettez-lui le nouveau de vive voix.`}
            action={reinitialiserMotDePasse.bind(null, compte.id)}
          />
        </div>
      </NouvelleVisite>

      <section className="mx-auto max-w-3xl border-t border-filet pt-6">
        <BoutonSupprimer
          action={supprimerCompte.bind(null, compte.id)}
          libelle="Supprimer le compte"
          titre="Supprimer ce compte ?"
          message={`${compte.name} ne pourra plus se connecter à l’espace admin. C’est définitif.`}
        />
      </section>
    </div>
  );
}
