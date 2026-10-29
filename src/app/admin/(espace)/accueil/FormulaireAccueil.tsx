"use client";

import { startTransition, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { BarreEnregistrement } from "@/components/admin/BarreEnregistrement";
import { ChampPhotos, type Photo } from "@/components/admin/ChampPhotos";
import { Carte, Champ, propsErreur, styleChamp } from "@/components/admin/ui";
import { useEnregistrement } from "@/components/admin/useEnregistrement";
import { TitreAccentue } from "@/components/TitreAccentue";
import type { EtatFormulaire } from "@/lib/actions/formulaires";
import type { ContenuAccueil } from "@/lib/accueil";
import { formatPrice } from "@/lib/products";

export type ChoixVedette = { id: string; name: string; price: number; categoryLabel: string; visible: boolean };

export function FormulaireAccueil({
  contenu,
  featuredId,
  version,
  articles,
  action,
}: {
  contenu: ContenuAccueil;
  featuredId: string | null;
  /** Date de modification de la fiche ; vide tant que la boutique n'a rien enregistré. */
  version: string;
  articles: ChoixVedette[];
  action: (etat: EtatFormulaire, formData: FormData) => Promise<EtatFormulaire>;
}) {
  const [etat, envoyer, enCours] = useEnregistrement(action, version);
  const formulaire = useRef<HTMLFormElement>(null);
  // Next.js garde les pages déjà visitées dans le document, masquées : chaque formulaire a ses propres identifiants.
  const uid = useId();
  const ident = (nom: string) => `${uid}${nom}`;
  const [photo, setPhoto] = useState<Photo[]>([{ url: contenu.heroImage, alt: contenu.heroImageAlt }]);
  const [medaillon, setMedaillon] = useState<Photo[]>(
    contenu.heroImage2 ? [{ url: contenu.heroImage2, alt: contenu.heroImage2Alt }] : [],
  );
  const [envois, setEnvois] = useState({ photo: false, medaillon: false });
  const [titre, setTitre] = useState(contenu.heroTitle);
  const [texte, setTexte] = useState(contenu.heroText);
  const [titreGros, setTitreGros] = useState(contenu.wholesaleTitle);
  const e = etat?.erreurs ?? {};

  useEffect(() => {
    if (etat?.erreurs) formulaire.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
  }, [etat]);

  function soumettre(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const donnees = new FormData(evenement.currentTarget);
    donnees.set("heroImage", photo[0]?.url ?? "");
    donnees.set("heroImage2", medaillon[0]?.url ?? "");
    startTransition(() => envoyer(donnees));
  }

  // L'article déjà choisi reste proposé même s'il est masqué du site, pour ne pas le perdre sans le vouloir.
  const choix = articles.filter((a) => a.visible || a.id === featuredId);
  const categories = [...new Set(choix.map((a) => a.categoryLabel))];
  const vedetteMasquee = articles.some((a) => a.id === featuredId && !a.visible);

  return (
    <form ref={formulaire} onSubmit={soumettre} noValidate className="mx-auto max-w-3xl space-y-5">
      <Carte titre="Haut de page" description="Le titre, le texte et les photos que l’on voit en arrivant sur le site.">
        <Champ
          id={ident("heroTitle")}
          label="Titre"
          aide="Court de préférence : il s’affiche en très grand. Entourez un ou deux mots d’astérisques pour les mettre en italique : L’éclat des *belles* choses."
          erreur={e.heroTitle}
        >
          <input
            id={ident("heroTitle")}
            name="heroTitle"
            value={titre}
            onChange={(ev) => setTitre(ev.target.value)}
            maxLength={90}
            className={styleChamp}
            {...propsErreur(ident("heroTitle"), e.heroTitle)}
          />
        </Champ>
        <Champ id={ident("heroText")} label="Texte sous le titre" erreur={e.heroText}>
          <textarea
            id={ident("heroText")}
            name="heroText"
            value={texte}
            onChange={(ev) => setTexte(ev.target.value)}
            rows={4}
            maxLength={300}
            className={styleChamp}
            {...propsErreur(ident("heroText"), e.heroText)}
          />
          <p className="prix mt-1 text-right text-xs text-douce">{texte.length} / 300</p>
        </Champ>

        <div aria-hidden className="rounded-xl bg-nuit px-5 py-6 text-ivoire">
          <p className="eyebrow text-or-clair">Aperçu</p>
          <p className="titre mt-3 text-[2.4rem] break-words">
            <TitreAccentue titre={titre || " "} />
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ivoire/75">{texte}</p>
        </div>
      </Carte>

      <Carte titre="Photos" description="Format portrait de préférence : la grande photo est recadrée en 4 × 5.">
        <Champ id={ident("heroImage")} label="Grande photo" erreur={e.heroImage}>
          <ChampPhotos
            id={ident("heroImage")}
            dossier="accueil"
            max={1}
            photos={photo}
            onChange={setPhoto}
            onEnvoi={(enCours) => setEnvois((v) => ({ ...v, photo: enCours }))}
            erreur={e.heroImage}
          />
        </Champ>
        <Champ
          id={ident("heroImageAlt")}
          label="Description de la grande photo"
          aide="Lue aux personnes malvoyantes et par Google : ce que montre la photo."
          erreur={e.heroImageAlt}
        >
          <input
            id={ident("heroImageAlt")}
            name="heroImageAlt"
            defaultValue={contenu.heroImageAlt}
            maxLength={160}
            className={styleChamp}
            {...propsErreur(ident("heroImageAlt"), e.heroImageAlt)}
          />
        </Champ>
        <Champ
          id={ident("heroImage2")}
          label="Petite photo en médaillon (facultatif)"
          aide="Posée dans le coin de la grande photo, en carré."
          erreur={e.heroImage2}
        >
          <ChampPhotos
            id={ident("heroImage2")}
            dossier="accueil"
            max={1}
            photos={medaillon}
            onChange={setMedaillon}
            onEnvoi={(enCours) => setEnvois((v) => ({ ...v, medaillon: enCours }))}
            erreur={e.heroImage2}
          />
        </Champ>
        {medaillon.length > 0 && (
          <Champ id={ident("heroImage2Alt")} label="Description du médaillon" erreur={e.heroImage2Alt}>
            <input
              id={ident("heroImage2Alt")}
              name="heroImage2Alt"
              defaultValue={contenu.heroImage2Alt}
              maxLength={160}
              className={styleChamp}
              {...propsErreur(ident("heroImage2Alt"), e.heroImage2Alt)}
            />
          </Champ>
        )}
        <Champ
          id={ident("featuredId")}
          label="Article signalé sur la photo"
          aide="Une vignette avec son nom et son prix, qui mène à sa fiche : choisissez l’article que montre la photo."
          erreur={e.featuredId}
        >
          <select
            id={ident("featuredId")}
            name="featuredId"
            defaultValue={featuredId ?? ""}
            className={styleChamp}
            {...propsErreur(ident("featuredId"), e.featuredId)}
          >
            <option value="">Aucun</option>
            {categories.map((categorie) => (
              <optgroup key={categorie} label={categorie}>
                {choix
                  .filter((a) => a.categoryLabel === categorie)
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} — {formatPrice(a.price)}
                      {a.visible ? "" : " (masqué du site)"}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
          {vedetteMasquee && (
            <p className="mt-1.5 text-sm text-douce">
              Cet article est masqué du site : la vignette n’apparaît pas tant qu’il n’est pas en ligne.
            </p>
          )}
        </Champ>
      </Carte>

      <Carte titre="Bloc « Vente en gros »" description="Le bloc sombre au milieu de l’accueil, pour les revendeuses et les boutiques.">
        <Champ
          id={ident("wholesaleTitle")}
          label="Titre"
          aide="Astérisques pour l’italique, comme en haut de page."
          erreur={e.wholesaleTitle}
        >
          <input
            id={ident("wholesaleTitle")}
            name="wholesaleTitle"
            value={titreGros}
            onChange={(ev) => setTitreGros(ev.target.value)}
            maxLength={80}
            className={styleChamp}
            {...propsErreur(ident("wholesaleTitle"), e.wholesaleTitle)}
          />
          <p aria-hidden className="titre mt-2 rounded-xl bg-nuit px-4 py-3 text-2xl text-ivoire">
            <TitreAccentue titre={titreGros || " "} />
          </p>
        </Champ>
        <Champ id={ident("wholesaleText")} label="Texte" erreur={e.wholesaleText}>
          <textarea
            id={ident("wholesaleText")}
            name="wholesaleText"
            defaultValue={contenu.wholesaleText}
            rows={4}
            maxLength={400}
            className={styleChamp}
            {...propsErreur(ident("wholesaleText"), e.wholesaleText)}
          />
        </Champ>
        <Champ
          id={ident("wholesalePoints")}
          label="Points forts"
          aide="Un par ligne, 6 au plus : la liste à droite du bloc."
          erreur={e.wholesalePoints}
        >
          <textarea
            id={ident("wholesalePoints")}
            name="wholesalePoints"
            defaultValue={contenu.wholesalePoints.join("\n")}
            rows={5}
            className={styleChamp}
            {...propsErreur(ident("wholesalePoints"), e.wholesalePoints)}
          />
        </Champ>
      </Carte>

      <p className="px-1 text-sm leading-relaxed text-douce">
        Les autres blocs de l’accueil se mettent à jour d’eux-mêmes : catégories, sélection (articles en ligne),
        actualités, questions (cochées dans la FAQ) et coordonnées.
      </p>

      <BarreEnregistrement etat={etat} enCours={enCours} retour="/admin" bloque={envois.photo || envois.medaillon}>
        {enCours ? "Enregistrement…" : "Enregistrer"}
      </BarreEnregistrement>
    </form>
  );
}
