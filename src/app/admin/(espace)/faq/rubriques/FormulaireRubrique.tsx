"use client";

import { startTransition, useEffect, useId, useRef, type FormEvent } from "react";
import { BarreEnregistrement } from "@/components/admin/BarreEnregistrement";
import { Carte, Champ, propsErreur, styleChamp } from "@/components/admin/ui";
import { useEnregistrement } from "@/components/admin/useEnregistrement";
import type { EtatFormulaire } from "@/lib/actions/formulaires";

export function FormulaireRubrique({
  titre,
  version,
  nouvelle,
  action,
}: {
  titre: string;
  /** Date de modification à l'ouverture du formulaire ; vide pour une nouvelle rubrique. */
  version: string;
  nouvelle: boolean;
  action: (etat: EtatFormulaire, formData: FormData) => Promise<EtatFormulaire>;
}) {
  const [etat, envoyer, enCours] = useEnregistrement(action, version);
  const formulaire = useRef<HTMLFormElement>(null);
  const uid = useId();
  const e = etat?.erreurs ?? {};

  useEffect(() => {
    if (etat?.erreurs) formulaire.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
  }, [etat]);

  function soumettre(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const donnees = new FormData(evenement.currentTarget);
    startTransition(() => envoyer(donnees));
  }

  return (
    <form ref={formulaire} onSubmit={soumettre} noValidate className="mx-auto max-w-3xl space-y-5">
      <Carte titre="Rubrique" description="Titre affiché au-dessus de ses questions, sur la page FAQ.">
        <Champ id={`${uid}title`} label="Nom de la rubrique" erreur={e.title}>
          <input
            id={`${uid}title`}
            name="title"
            defaultValue={titre}
            maxLength={60}
            placeholder="Ex. Échanges & retours"
            className={styleChamp}
            {...propsErreur(`${uid}title`, e.title)}
          />
        </Champ>
      </Carte>

      <BarreEnregistrement etat={etat} enCours={enCours} retour="/admin/faq">
        {enCours ? "Enregistrement…" : nouvelle ? "Créer la rubrique" : "Enregistrer"}
      </BarreEnregistrement>
    </form>
  );
}
