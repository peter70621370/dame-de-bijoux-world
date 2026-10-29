"use client";

import Image from "next/image";
import { startTransition, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { ImageOff, Search, X } from "lucide-react";
import { BarreEnregistrement } from "@/components/admin/BarreEnregistrement";
import { ChampPhotos } from "@/components/admin/ChampPhotos";
import { Carte, Champ, Interrupteur, propsErreur, styleChamp } from "@/components/admin/ui";
import { useEnregistrement } from "@/components/admin/useEnregistrement";
import type { EtatFormulaire } from "@/lib/actions/formulaires";
import { formatPrice } from "@/lib/products";

export type ActualiteEditee = {
  title: string;
  excerpt: string;
  body: string;
  image: string;
  published: boolean;
  /** Date affichée (AAAA-MM-JJ). */
  publishedAt: string;
  /** Articles présentés (identifiants). */
  articles: string[];
  /** Date de modification de la fiche à l'ouverture du formulaire ; vide pour une nouvelle actualité. */
  version: string;
};

export type ArticleChoix = {
  id: string;
  name: string;
  price: number;
  /** Prix promo en cours, sinon null. */
  promoPrice: number | null;
  categoryLabel: string;
  visible: boolean;
  photo?: string;
};

const MAX_ARTICLES = 24;

export function FormulaireActualite({
  actualite,
  articles,
  aujourdhui,
  action,
  nouvelle,
}: {
  actualite: ActualiteEditee;
  articles: ArticleChoix[];
  /** Date du jour (AAAA-MM-JJ) : une actualité ne peut pas être datée de demain. */
  aujourdhui: string;
  action: (etat: EtatFormulaire, formData: FormData) => Promise<EtatFormulaire>;
  nouvelle: boolean;
}) {
  const [etat, envoyer, enCours] = useEnregistrement(action, actualite.version);
  const formulaire = useRef<HTMLFormElement>(null);
  // Next.js garde les pages déjà visitées dans le document, masquées : chaque formulaire a ses propres identifiants.
  const uid = useId();
  const ident = (nom: string) => `${uid}${nom}`;
  const [photos, setPhotos] = useState(actualite.image ? [{ url: actualite.image, alt: "" }] : []);
  const [envoiPhotos, setEnvoiPhotos] = useState(false);
  const [choisis, setChoisis] = useState(actualite.articles);
  const e = etat?.erreurs ?? {};

  // Après un refus, amène la personne au premier champ à corriger.
  useEffect(() => {
    if (etat?.erreurs) formulaire.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
  }, [etat]);

  function soumettre(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const donnees = new FormData(evenement.currentTarget);
    donnees.set("image", photos[0]?.url ?? "");
    donnees.set("articles", JSON.stringify(choisis));
    startTransition(() => envoyer(donnees));
  }

  return (
    <form ref={formulaire} onSubmit={soumettre} noValidate className="mx-auto max-w-3xl space-y-5">
      <Carte
        titre="Photo de couverture"
        description="En tête de l’actualité et sur sa vignette. Sans photo, la vignette affiche le logo."
      >
        <ChampPhotos
          id={ident("image")}
          dossier="actualites"
          max={1}
          photos={photos}
          onChange={setPhotos}
          onEnvoi={setEnvoiPhotos}
          erreur={e.image}
        />
      </Carte>

      <Carte titre="Texte">
        <Champ id={ident("title")} label="Titre" erreur={e.title}>
          <input
            id={ident("title")}
            name="title"
            defaultValue={actualite.title}
            maxLength={120}
            placeholder="Ex. Arrivage de bracelets dorés"
            className={styleChamp}
            {...propsErreur(ident("title"), e.title)}
          />
        </Champ>
        <Champ
          id={ident("excerpt")}
          label="Résumé"
          aide="Une phrase, sous le titre de la vignette et dans les partages. Vide : la première phrase du texte."
          erreur={e.excerpt}
        >
          <input
            id={ident("excerpt")}
            name="excerpt"
            defaultValue={actualite.excerpt}
            maxLength={200}
            className={styleChamp}
            {...propsErreur(ident("excerpt"), e.excerpt)}
          />
        </Champ>
        <Champ
          id={ident("body")}
          label="Texte"
          aide="Laissez une ligne vide entre deux paragraphes."
          erreur={e.body}
        >
          <textarea
            id={ident("body")}
            name="body"
            defaultValue={actualite.body}
            rows={8}
            maxLength={10_000}
            className={styleChamp}
            {...propsErreur(ident("body"), e.body)}
          />
        </Champ>
      </Carte>

      <Carte
        titre="Articles présentés"
        description="Facultatif : montrés sous l’actualité, avec leur prix et le bouton de commande. Seuls les articles en ligne apparaissent sur le site."
      >
        <ChoixArticles
          id={ident("articles")}
          articles={articles}
          choisis={choisis}
          onChange={setChoisis}
          erreur={e.articles}
        />
      </Carte>

      <Carte titre="Publication">
        <Interrupteur
          name="published"
          label="En ligne"
          description="Décochée, l’actualité reste ici en brouillon, invisible sur le site."
          defaultChecked={actualite.published}
        />
        <Champ
          id={ident("publishedAt")}
          label="Date affichée"
          aide="Les actualités sont rangées de la plus récente à la plus ancienne."
          erreur={e.publishedAt}
        >
          <input
            id={ident("publishedAt")}
            name="publishedAt"
            type="date"
            defaultValue={actualite.publishedAt}
            max={aujourdhui}
            className={`${styleChamp} sm:max-w-60`}
            {...propsErreur(ident("publishedAt"), e.publishedAt)}
          />
        </Champ>
      </Carte>

      <BarreEnregistrement etat={etat} enCours={enCours} retour="/admin/actualites" bloque={envoiPhotos}>
        {enCours
          ? "Enregistrement…"
          : envoiPhotos
            ? "Envoi de la photo…"
            : nouvelle
              ? "Ajouter l’actualité"
              : "Enregistrer"}
      </BarreEnregistrement>
    </form>
  );
}

const sansAccents = (texte: string) =>
  texte
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/** Articles à cocher, rangés par catégorie, avec une recherche ; les articles choisis sont rappelés au-dessus. */
function ChoixArticles({
  id,
  articles,
  choisis,
  onChange,
  erreur,
}: {
  id: string;
  articles: ArticleChoix[];
  choisis: string[];
  onChange: (choisis: string[]) => void;
  erreur?: string;
}) {
  const [recherche, setRecherche] = useState("");
  const plein = choisis.length >= MAX_ARTICLES;
  const selection = choisis.flatMap((choisi) => articles.filter((a) => a.id === choisi));

  const mots = sansAccents(recherche).split(/\s+/).filter(Boolean);
  // Les articles arrivent triés par catégorie : on les regroupe sous leur catégorie.
  const groupes: { label: string; articles: ArticleChoix[] }[] = [];
  for (const a of articles) {
    if (!mots.every((mot) => sansAccents(`${a.name} ${a.categoryLabel}`).includes(mot))) continue;
    const dernier = groupes.at(-1);
    if (dernier?.label === a.categoryLabel) dernier.articles.push(a);
    else groupes.push({ label: a.categoryLabel, articles: [a] });
  }

  const basculer = (article: string) =>
    onChange(choisis.includes(article) ? choisis.filter((c) => c !== article) : [...choisis, article]);

  if (articles.length === 0) {
    return <p className="text-sm text-douce">Aucun article dans le catalogue pour l’instant.</p>;
  }

  return (
    <div>
      <div className="flex min-h-9 items-center justify-between gap-3">
        <p role="status" className="text-sm">
          {selection.length === 0
            ? "Aucun article choisi."
            : `${selection.length} article${selection.length > 1 ? "s" : ""} choisi${selection.length > 1 ? "s" : ""}${
                plein ? ` (${MAX_ARTICLES} au maximum)` : ""
              }.`}
        </p>
        {selection.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="h-9 rounded-lg px-2 text-sm text-douce underline underline-offset-4 hover:text-encre"
          >
            Tout retirer
          </button>
        )}
      </div>

      {selection.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-2">
          {selection.map((a) => (
            <li key={a.id} className="flex max-w-full items-center gap-2 rounded-full border border-filet bg-white py-1 pr-1 pl-1">
              <span className="relative grid size-7 shrink-0 place-items-center overflow-hidden rounded-full bg-sable text-douce">
                {a.photo ? (
                  <Image src={a.photo} alt="" fill sizes="28px" className="object-cover" />
                ) : (
                  <ImageOff size={12} aria-hidden />
                )}
              </span>
              <span className="min-w-0 truncate text-sm">{a.name}</span>
              <button
                type="button"
                onClick={() => basculer(a.id)}
                aria-label={`Retirer « ${a.name} »`}
                className="grid size-7 shrink-0 place-items-center rounded-full text-douce transition-colors hover:bg-rubis/8 hover:text-rubis"
              >
                <X size={14} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      <label className="relative mt-4 block">
        <span className="sr-only">Rechercher un article</span>
        <Search size={18} aria-hidden className="absolute top-1/2 left-3.5 -translate-y-1/2 text-douce" />
        <input
          id={id}
          type="search"
          value={recherche}
          onChange={(ev) => setRecherche(ev.target.value)}
          placeholder="Rechercher un article"
          className={`${styleChamp} pl-11`}
          {...propsErreur(id, erreur)}
        />
      </label>

      <div className="mt-3 max-h-96 overflow-y-auto overscroll-contain rounded-xl border border-filet bg-white">
        {groupes.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-douce">Aucun article ne correspond à cette recherche.</p>
        ) : (
          groupes.map((g) => (
            <div key={g.label} role="group" aria-label={g.label}>
              <p
                aria-hidden
                className="eyebrow sticky top-0 z-10 border-b border-filet bg-sable px-4 py-2 text-[0.62rem] text-douce"
              >
                {g.label}
              </p>
              <ul className="divide-y divide-filet">
                {g.articles.map((a) => {
                  const coche = choisis.includes(a.id);
                  return (
                    <li key={a.id}>
                      <label
                        className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50 ${
                          coche ? "bg-or/10" : "hover:bg-sable/40"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={coche}
                          disabled={!coche && plein}
                          onChange={() => basculer(a.id)}
                          className="size-5 shrink-0 accent-nuit"
                        />
                        <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-sable text-douce">
                          {a.photo ? (
                            <Image src={a.photo} alt="" fill sizes="44px" className="object-cover" />
                          ) : (
                            <ImageOff size={16} aria-hidden />
                          )}
                        </span>
                        <span className="min-w-0 flex-1 text-sm">
                          <span className="block truncate font-medium">{a.name}</span>
                          <span className="block truncate text-douce">
                            <span className="prix">{formatPrice(a.promoPrice ?? a.price)}</span>
                            {!a.visible && " · masqué du site"}
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </div>
      {erreur && (
        <p id={`${id}-erreur`} className="mt-2 text-sm text-rubis">
          {erreur}
        </p>
      )}
    </div>
  );
}
