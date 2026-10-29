"use client";

import { startTransition, useActionState, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { BarreEnregistrement } from "@/components/admin/BarreEnregistrement";
import { useConfirmationEnregistrement } from "@/components/admin/Confirmation";
import { Carte, Champ, propsErreur, styleChamp } from "@/components/admin/ui";
import type { Role } from "@/generated/prisma/enums";
import type { EtatFormulaire } from "@/lib/actions/formulaires";
import { ORDRE_ROLES, ROLES } from "@/lib/roles";

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

/** Choix du rôle : deux cartes, chacune avec ce qu'elle permet. */
function ChoixRole({
  id,
  defaut,
  erreur,
  legende = true,
}: {
  id: string;
  defaut: Role;
  erreur?: string;
  /** false : déjà dit par le titre de la carte, gardé pour les lecteurs d'écran. */
  legende?: boolean;
}) {
  return (
    <fieldset aria-describedby={erreur ? `${id}-erreur` : undefined}>
      <legend className={legende ? "text-sm font-medium" : "sr-only"}>Rôle</legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {ORDRE_ROLES.map((r) => (
          <label
            key={r}
            className="flex cursor-pointer gap-3 rounded-xl border border-filet bg-white p-4 transition-colors hover:border-encre/40 has-[:checked]:border-nuit has-[:checked]:ring-1 has-[:checked]:ring-nuit has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-or"
          >
            <input
              type="radio"
              name="role"
              value={r}
              defaultChecked={r === defaut}
              className="mt-0.5 size-4 shrink-0 accent-nuit"
            />
            <span>
              <span className="block text-sm font-medium">{ROLES[r].label}</span>
              <span className="mt-1 block text-sm leading-relaxed text-douce">{ROLES[r].description}</span>
            </span>
          </label>
        ))}
      </div>
      {erreur && (
        <p id={`${id}-erreur`} className="mt-2 text-sm text-rubis">
          {erreur}
        </p>
      )}
    </fieldset>
  );
}

const AIDE_MOT_DE_PASSE = "10 caractères au moins. Une phrase facile à retenir fait un bon mot de passe.";

/** Erreur éventuelle et bouton, sous un formulaire de la fiche d'un compte (plusieurs formulaires par page). */
function Pied({ etat, enCours, children }: { etat: EtatFormulaire; enCours: boolean; children: string }) {
  useConfirmationEnregistrement(etat);

  return (
    <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 border-t border-filet pt-4">
      {etat?.message && !enCours && (
        <p role="alert" className="w-full text-sm text-rubis sm:mr-auto sm:w-auto">
          {etat.message}
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
        <Champ id={ident("name")} label="Nom affiché" aide="Dans le menu de l’espace admin." erreur={e.name}>
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
        <ChoixRole id={ident("role")} defaut="UTILISATEUR" erreur={e.role} />
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

/** Rôle d'un autre compte, sur sa fiche (administrateurs seulement). */
export function FormulaireRole({ nom, role, action }: { nom: string; role: Role; action: Action }) {
  const { etat, enCours, formulaire, soumettre, e } = useFormulaire(action);
  const uid = useId();

  return (
    <form ref={formulaire} onSubmit={soumettre} noValidate>
      <Carte titre="Rôle" description={`Ce que ${nom} peut modifier. Le changement compte dès sa prochaine page.`}>
        <ChoixRole id={`${uid}role`} defaut={role} erreur={e.role} legende={false} />
        <Pied etat={etat} enCours={enCours}>
          Enregistrer le rôle
        </Pied>
      </Carte>
    </form>
  );
}
