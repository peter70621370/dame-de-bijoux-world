"use client";

import { startTransition, useActionState, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { BarreEnregistrement } from "@/components/admin/BarreEnregistrement";
import { ChampPhotos } from "@/components/admin/ChampPhotos";
import { Carte, Champ, Interrupteur, propsErreur, styleChamp } from "@/components/admin/ui";
import type { EtatFormulaire } from "@/lib/actions/formulaires";

export type CategorieEditee = {
  label: string;
  tag: string;
  blurb: string;
  onRequest: boolean;
  image: string;
};

/** « Bracelets » → « Bracelet », « Parures & beauté » → « Parure » : proposition pour la pastille des photos. */
function suggestionTag(label: string) {
  const mot = label.trim().split(/[\s&,/]+/)[0] ?? "";
  return mot.length > 3 && /[^s]s$/i.test(mot) ? mot.slice(0, -1) : mot;
}

export function FormulaireCategorie({
  categorie,
  action,
  nouvelle,
}: {
  categorie: CategorieEditee;
  action: (etat: EtatFormulaire, formData: FormData) => Promise<EtatFormulaire>;
  nouvelle: boolean;
}) {
  const [etat, envoyer, enCours] = useActionState(action, undefined);
  const formulaire = useRef<HTMLFormElement>(null);
  // Next.js garde les pages déjà visitées dans le document, masquées : chaque formulaire a ses propres identifiants.
  const uid = useId();
  const ident = (nom: string) => `${uid}${nom}`;
  const [photos, setPhotos] = useState(categorie.image ? [{ url: categorie.image, alt: "" }] : []);
  const [envoiPhotos, setEnvoiPhotos] = useState(false);
  const [tag, setTag] = useState(categorie.tag);
  const [tagSaisi, setTagSaisi] = useState(categorie.tag !== "");
  const e = etat?.erreurs ?? {};

  // Après un refus, amène la personne au premier champ à corriger.
  useEffect(() => {
    if (etat?.erreurs) formulaire.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
  }, [etat]);

  function soumettre(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const donnees = new FormData(evenement.currentTarget);
    donnees.set("image", photos[0]?.url ?? "");
    startTransition(() => envoyer(donnees));
  }

  return (
    <form ref={formulaire} onSubmit={soumettre} noValidate className="mx-auto max-w-3xl space-y-5">
      <Carte titre="Informations">
        <Champ
          id={ident("label")}
          label="Nom de la catégorie"
          aide="Au pluriel, comme sur l’accueil : « Bracelets », « Boucles d’oreilles »…"
          erreur={e.label}
        >
          <input
            id={ident("label")}
            name="label"
            defaultValue={categorie.label}
            maxLength={60}
            onChange={(ev) => {
              if (!tagSaisi) setTag(suggestionTag(ev.target.value));
            }}
            className={styleChamp}
            {...propsErreur(ident("label"), e.label)}
          />
        </Champ>
        <Champ
          id={ident("tag")}
          label="Mot affiché sur les photos"
          aide="Petite étiquette sur la photo de chaque article de la catégorie : « Bracelet », « Bague »…"
          erreur={e.tag}
        >
          <input
            id={ident("tag")}
            name="tag"
            value={tag}
            maxLength={24}
            onChange={(ev) => {
              setTag(ev.target.value);
              setTagSaisi(true);
            }}
            className={`${styleChamp} sm:max-w-60`}
            {...propsErreur(ident("tag"), e.tag)}
          />
        </Champ>
        <Champ
          id={ident("blurb")}
          label="Phrase de présentation"
          aide="Sous le nom de la catégorie, sur l’accueil et dans « Sur demande »."
          erreur={e.blurb}
        >
          <textarea
            id={ident("blurb")}
            name="blurb"
            defaultValue={categorie.blurb}
            rows={2}
            maxLength={200}
            placeholder="Ex. Joncs, chaînes fines et motifs porte-bonheur."
            className={styleChamp}
            {...propsErreur(ident("blurb"), e.blurb)}
          />
        </Champ>
      </Carte>

      <Carte
        titre="Photo de la tuile"
        description="Montrée sur l’accueil, dans « Trouvez votre pièce ». Sans photo, la tuile affiche l’initiale du nom sur fond clair."
      >
        <ChampPhotos
          id={ident("image")}
          dossier="categories"
          max={1}
          photos={photos}
          onChange={setPhotos}
          onEnvoi={setEnvoiPhotos}
          erreur={e.image}
        />
      </Carte>

      <Carte titre="Sur le site">
        <Interrupteur
          name="onRequest"
          label="Sur demande"
          description="Pour une catégorie dont les articles ne sont pas encore en ligne : elle est présentée dans « Et bien d’autres pièces », avec un bouton pour demander les modèles sur WhatsApp."
          defaultChecked={categorie.onRequest}
        />
      </Carte>

      <BarreEnregistrement etat={etat} enCours={enCours} retour="/admin/categories" bloque={envoiPhotos}>
        {enCours ? "Enregistrement…" : envoiPhotos ? "Envoi de la photo…" : nouvelle ? "Créer la catégorie" : "Enregistrer"}
      </BarreEnregistrement>
    </form>
  );
}
