"use client";

import { startTransition, useActionState, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { BarreEnregistrement } from "@/components/admin/BarreEnregistrement";
import { Carte, Champ, propsErreur, styleChamp } from "@/components/admin/ui";
import type { EtatFormulaire } from "@/lib/actions/formulaires";

type Action = (etat: EtatFormulaire, formData: FormData) => Promise<EtatFormulaire>;

/** useActionState + retour au premier champ refusé ; `vider` efface les champs après un succès (mots de passe). */
function useFormulaire(action: Action, vider = false) {
  const [etat, envoyer, enCours] = useActionState(action, undefined);
  const formulaire = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (etat?.erreurs) formulaire.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
    if (etat?.ok && vider) formulaire.current?.reset();
  }, [etat, vider]);

  function soumettre(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const donnees = new FormData(evenement.currentTarget);
    startTransition(() => envoyer(donnees));
  }

  return { etat, enCours, formulaire, soumettre, e: etat?.erreurs ?? {} };
}

function ChampMotDePasse({
  id,
  name,
  label,
  aide,
  erreur,
  autoComplete,
}: {
  id: string;
  name: string;
  label: string;
  aide?: string;
  erreur?: string;
  autoComplete: "current-password" | "new-password";
}) {
  const [visible, setVisible] = useState(false);
  return (
    <Champ id={id} label={label} aide={aide} erreur={erreur}>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          maxLength={64}
          className={`${styleChamp} pr-12`}
          {...propsErreur(id, erreur)}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          className="absolute inset-y-0 right-0 grid w-12 place-items-center text-douce hover:text-encre"
        >
          {visible ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
        </button>
      </div>
    </Champ>
  );
}

const AIDE_MOT_DE_PASSE = "10 caractères au moins. Une phrase facile à retenir fait un bon mot de passe.";

/** Réponse du serveur et bouton, sous un formulaire de la fiche d'un compte (plusieurs formulaires par page). */
function Pied({ etat, enCours, children }: { etat: EtatFormulaire; enCours: boolean; children: string }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 border-t border-filet pt-4">
      {etat?.message && !enCours && (
        <p role="alert" className="w-full text-sm text-rubis sm:mr-auto sm:w-auto">
          {etat.message}
        </p>
      )}
      {etat?.ok && !enCours && (
        <p role="status" className="w-full text-sm text-[#187a42] sm:mr-auto sm:w-auto">
          {etat.ok}
        </p>
      )}
      <button type="submit" disabled={enCours} className="bouton bouton-nuit w-full sm:w-auto">
        {enCours ? "Enregistrement…" : children}
      </button>
    </div>
  );
}

export function FormulaireNouveauCompte({ action }: { action: Action }) {
  const { etat, enCours, formulaire, soumettre, e } = useFormulaire(action);
  const uid = useId();
  const ident = (nom: string) => `${uid}${nom}`;

  return (
    <form ref={formulaire} onSubmit={soumettre} noValidate className="mx-auto max-w-3xl space-y-5">
      <Carte
        titre="Nouveau compte"
        description="La personne se connecte avec cette adresse et ce mot de passe ; elle pourra le changer ensuite."
      >
        <Champ id={ident("name")} label="Nom affiché" aide="Dans le menu du back-office." erreur={e.name}>
          <input
            id={ident("name")}
            name="name"
            maxLength={40}
            autoComplete="off"
            className={styleChamp}
            {...propsErreur(ident("name"), e.name)}
          />
        </Champ>
        <Champ id={ident("email")} label="Adresse e-mail" erreur={e.email}>
          <input
            id={ident("email")}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="off"
            maxLength={120}
            className={styleChamp}
            {...propsErreur(ident("email"), e.email)}
          />
        </Champ>
        <ChampMotDePasse
          id={ident("password")}
          name="password"
          label="Mot de passe"
          aide={AIDE_MOT_DE_PASSE}
          erreur={e.password}
          autoComplete="new-password"
        />
      </Carte>

      <BarreEnregistrement etat={etat} enCours={enCours} retour="/admin/comptes">
        {enCours ? "Création…" : "Créer le compte"}
      </BarreEnregistrement>
    </form>
  );
}

export function FormulaireProfil({ nom, email, action }: { nom: string; email: string; action: Action }) {
  const { etat, enCours, formulaire, soumettre, e } = useFormulaire(action);
  const uid = useId();
  const ident = (n: string) => `${uid}${n}`;

  return (
    <form ref={formulaire} onSubmit={soumettre} noValidate>
      <Carte titre="Mon profil">
        <Champ id={ident("name")} label="Nom affiché" erreur={e.name}>
          <input
            id={ident("name")}
            name="name"
            defaultValue={nom}
            maxLength={40}
            autoComplete="name"
            className={styleChamp}
            {...propsErreur(ident("name"), e.name)}
          />
        </Champ>
        <Champ id={ident("email")} label="Adresse e-mail" aide="Celle qui sert à vous connecter." erreur={e.email}>
          <input
            id={ident("email")}
            name="email"
            type="email"
            inputMode="email"
            defaultValue={email}
            maxLength={120}
            autoComplete="email"
            className={styleChamp}
            {...propsErreur(ident("email"), e.email)}
          />
        </Champ>
        <Pied etat={etat} enCours={enCours}>
          Enregistrer
        </Pied>
      </Carte>
    </form>
  );
}

/**
 * Mot de passe : le sien (`avecActuel`, l'actuel est demandé) ou celui d'un autre compte (oublié, bloqué).
 */
export function FormulaireMotDePasse({
  avecActuel,
  titre,
  description,
  action,
}: {
  avecActuel: boolean;
  titre: string;
  description?: string;
  action: Action;
}) {
  const { etat, enCours, formulaire, soumettre, e } = useFormulaire(action, true);
  const uid = useId();
  const ident = (n: string) => `${uid}${n}`;

  return (
    <form ref={formulaire} onSubmit={soumettre} noValidate>
      <Carte titre={titre} description={description}>
        {avecActuel && (
          <ChampMotDePasse
            id={ident("actuel")}
            name="actuel"
            label="Mot de passe actuel"
            erreur={e.actuel}
            autoComplete="current-password"
          />
        )}
        <ChampMotDePasse
          id={ident("password")}
          name="password"
          label="Nouveau mot de passe"
          aide={AIDE_MOT_DE_PASSE}
          erreur={e.password}
          autoComplete="new-password"
        />
        <ChampMotDePasse
          id={ident("confirmation")}
          name="confirmation"
          label="Nouveau mot de passe, une seconde fois"
          erreur={e.confirmation}
          autoComplete="new-password"
        />
        <Pied etat={etat} enCours={enCours}>
          {avecActuel ? "Changer mon mot de passe" : "Enregistrer le mot de passe"}
        </Pied>
      </Carte>
    </form>
  );
}
