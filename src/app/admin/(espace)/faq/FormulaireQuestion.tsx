"use client";

import { startTransition, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { BarreEnregistrement } from "@/components/admin/BarreEnregistrement";
import { Carte, Champ, Interrupteur, propsErreur, styleChamp } from "@/components/admin/ui";
import { useEnregistrement } from "@/components/admin/useEnregistrement";
import type { EtatFormulaire } from "@/lib/actions/formulaires";

export type QuestionEditee = {
  sectionId: string;
  question: string;
  answer: string;
  onHome: boolean;
  /** Date de modification à l'ouverture du formulaire ; vide pour une nouvelle question. */
  version: string;
};

export function FormulaireQuestion({
  question,
  rubriques,
  surAccueil,
  nouvelle,
  action,
}: {
  question: QuestionEditee;
  rubriques: { id: string; title: string }[];
  /** Autres questions déjà reprises sur l'accueil. */
  surAccueil: string[];
  nouvelle: boolean;
  action: (etat: EtatFormulaire, formData: FormData) => Promise<EtatFormulaire>;
}) {
  const [etat, envoyer, enCours] = useEnregistrement(action, question.version);
  const formulaire = useRef<HTMLFormElement>(null);
  // Next.js garde les pages déjà visitées dans le document, masquées : chaque formulaire a ses propres identifiants.
  const uid = useId();
  const ident = (nom: string) => `${uid}${nom}`;
  const [intitule, setIntitule] = useState(question.question);
  const [reponse, setReponse] = useState(question.answer);
  const e = etat?.erreurs ?? {};

  useEffect(() => {
    if (etat?.erreurs) formulaire.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
  }, [etat]);

  function soumettre(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const donnees = new FormData(evenement.currentTarget);
    startTransition(() => envoyer(donnees));
  }

  const accueilPlein = surAccueil.length >= 3;

  return (
    <form ref={formulaire} onSubmit={soumettre} noValidate className="mx-auto max-w-3xl space-y-5">
      <Carte titre="Question et réponse">
        <Champ id={ident("sectionId")} label="Rubrique" erreur={e.sectionId}>
          <select
            id={ident("sectionId")}
            name="sectionId"
            defaultValue={question.sectionId}
            className={styleChamp}
            {...propsErreur(ident("sectionId"), e.sectionId)}
          >
            {rubriques.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
        </Champ>
        <Champ id={ident("question")} label="Question" erreur={e.question}>
          <input
            id={ident("question")}
            name="question"
            value={intitule}
            onChange={(ev) => setIntitule(ev.target.value)}
            maxLength={160}
            placeholder="Ex. Peut-on échanger un article ?"
            className={styleChamp}
            {...propsErreur(ident("question"), e.question)}
          />
          <p className="prix mt-1 text-right text-xs text-douce">{intitule.length} / 160</p>
        </Champ>
        <Champ id={ident("answer")} label="Réponse" aide="Une ligne vide sépare deux paragraphes." erreur={e.answer}>
          <textarea
            id={ident("answer")}
            name="answer"
            value={reponse}
            onChange={(ev) => setReponse(ev.target.value)}
            rows={7}
            maxLength={1500}
            className={styleChamp}
            {...propsErreur(ident("answer"), e.answer)}
          />
          <p className="prix mt-1 text-right text-xs text-douce">{reponse.length} / 1 500</p>
        </Champ>
      </Carte>

      <Carte titre="Accueil">
        <div>
          <Interrupteur
            name="onHome"
            label="Reprendre sur l’accueil"
            description={
              accueilPlein && !question.onHome
                ? `Déjà trois questions sur l’accueil (${surAccueil.map((q) => `« ${q} »`).join(", ")}) : décochez d’abord l’une d’elles.`
                : `Dans le bloc « Vos questions », trois au plus (${surAccueil.length} déjà).`
            }
            defaultChecked={question.onHome}
          />
          {e.onHome && (
            <p role="alert" className="mt-2 text-sm text-rubis">
              {e.onHome}
            </p>
          )}
        </div>
      </Carte>

      <BarreEnregistrement etat={etat} enCours={enCours} retour="/admin/faq">
        {enCours ? "Enregistrement…" : nouvelle ? "Ajouter la question" : "Enregistrer"}
      </BarreEnregistrement>
    </form>
  );
}
