"use client";

import Image from "next/image";
import { startTransition, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { BarreEnregistrement } from "@/components/admin/BarreEnregistrement";
import { ChampPhotos, type Photo } from "@/components/admin/ChampPhotos";
import { Carte, Champ, Interrupteur, propsErreur, styleChamp } from "@/components/admin/ui";
import { useEnregistrement } from "@/components/admin/useEnregistrement";
import type { EtatFormulaire } from "@/lib/actions/formulaires";
import { discountPercent, formatPrice, formatPromoEnd } from "@/lib/products";

export type ArticleEdite = {
  name: string;
  categoryId: string;
  price: string;
  short: string;
  description: string;
  details: string;
  published: boolean;
  isNew: boolean;
  photos: Photo[];
  optionName: string;
  optionPlural: string;
  variantes: { label: string; photo: string | null }[];
  promoPrice: string;
  promoEndsAt: string;
  /** Date de modification de la fiche à l'ouverture du formulaire ; vide pour un nouvel article. */
  version: string;
};

type Variante = ArticleEdite["variantes"][number] & { cle: string };

const enNombre = (texte: string) => Number(texte.replace(/[^\d]/g, "")) || 0;

export function FormulaireArticle({
  article,
  categories,
  action,
  nouveau,
}: {
  article: ArticleEdite;
  categories: { id: string; label: string }[];
  action: (etat: EtatFormulaire, formData: FormData) => Promise<EtatFormulaire>;
  nouveau: boolean;
}) {
  const [etat, envoyer, enCours] = useEnregistrement(action, article.version);
  const formulaire = useRef<HTMLFormElement>(null);
  // Next.js garde les pages déjà visitées dans le document, masquées : chaque formulaire a ses propres identifiants.
  const uid = useId();
  const ident = (nom: string) => `${uid}${nom}`;
  const [photos, setPhotos] = useState(article.photos);
  const [envoiPhotos, setEnvoiPhotos] = useState(false);
  const [optionName, setOptionName] = useState(article.optionName);
  const [optionPlural, setOptionPlural] = useState(article.optionPlural);
  const [pluralSaisi, setPluralSaisi] = useState(article.optionPlural !== "");
  // Clés stables pour les valeurs déjà enregistrées (identiques au rendu serveur), aléatoires pour les nouvelles.
  const [variantes, setVariantes] = useState<Variante[]>(() =>
    article.variantes.map((v, i) => ({ ...v, cle: `v${i}` })),
  );
  const [prix, setPrix] = useState(article.price);
  const [promo, setPromo] = useState(article.promoPrice);
  const [finPromo, setFinPromo] = useState(article.promoEndsAt);
  const e = etat?.erreurs ?? {};

  // Après un refus, amène la personne au premier champ à corriger.
  useEffect(() => {
    if (etat?.erreurs) formulaire.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
  }, [etat]);

  function soumettre(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const donnees = new FormData(evenement.currentTarget);
    donnees.set("photos", JSON.stringify(photos.map(({ url }) => ({ url }))));
    donnees.set(
      "variantes",
      JSON.stringify(
        variantes.map(({ label, photo }) => ({
          label,
          photo: photos.some((p) => p.url === photo) ? photo : null,
        })),
      ),
    );
    startTransition(() => envoyer(donnees));
  }

  function changerVariante(cle: string, modif: Partial<Variante>) {
    setVariantes((liste) => liste.map((v) => (v.cle === cle ? { ...v, ...modif } : v)));
  }

  const montantPromo = enNombre(promo);
  const montantPrix = enNombre(prix);
  const promoValide = montantPromo > 0 && montantPromo < montantPrix;

  return (
    <form ref={formulaire} onSubmit={soumettre} noValidate className="mx-auto max-w-3xl space-y-5">
      <Carte
        titre="Photos"
        description="La première est la photo principale. Elles sont réduites avant l’envoi pour aller vite, même en 3G."
      >
        <ChampPhotos
          id={ident("photos")}
          dossier="produits"
          max={12}
          photos={photos}
          onChange={setPhotos}
          onEnvoi={setEnvoiPhotos}
          erreur={e.photos}
        />
      </Carte>

      <Carte titre="Informations">
        <Champ id={ident("name")} label="Nom de l’article" erreur={e.name}>
          <input
            id={ident("name")}
            name="name"
            defaultValue={article.name}
            maxLength={120}
            placeholder="Ex. Bracelet Trèfle"
            className={styleChamp}
            {...propsErreur(ident("name"), e.name)}
          />
        </Champ>
        <div className="grid gap-5 sm:grid-cols-2">
          <Champ id={ident("categoryId")} label="Catégorie" erreur={e.categoryId}>
            <select
              id={ident("categoryId")}
              name="categoryId"
              defaultValue={article.categoryId}
              className={styleChamp}
              {...propsErreur(ident("categoryId"), e.categoryId)}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </Champ>
          <Champ id={ident("price")} label="Prix (FCFA)" erreur={e.price}>
            <input
              id={ident("price")}
              name="price"
              inputMode="numeric"
              value={prix}
              onChange={(ev) => setPrix(ev.target.value)}
              placeholder="Ex. 1 500"
              className={`${styleChamp} prix`}
              {...propsErreur(ident("price"), e.price)}
            />
          </Champ>
        </div>
        <Champ
          id={ident("short")}
          label="Résumé"
          aide="Une phrase, montrée par Google et dans les partages. Vide : la première phrase de la description."
          erreur={e.short}
        >
          <input
            id={ident("short")}
            name="short"
            defaultValue={article.short}
            maxLength={200}
            className={styleChamp}
            {...propsErreur(ident("short"), e.short)}
          />
        </Champ>
        <Champ id={ident("description")} label="Description" erreur={e.description}>
          <textarea
            id={ident("description")}
            name="description"
            defaultValue={article.description}
            rows={5}
            maxLength={5000}
            className={styleChamp}
            {...propsErreur(ident("description"), e.description)}
          />
        </Champ>
        <Champ
          id={ident("details")}
          label="Détails"
          aide="Un détail par ligne : matière, dimensions, fermoir…"
          erreur={e.details}
        >
          <textarea
            id={ident("details")}
            name="details"
            defaultValue={article.details}
            rows={4}
            className={styleChamp}
            {...propsErreur(ident("details"), e.details)}
          />
        </Champ>
      </Carte>

      <Carte titre="Sur le site">
        <Interrupteur
          name="published"
          label="En ligne"
          description="Décoché, l’article reste ici mais disparaît du site (rupture de stock, par exemple)."
          defaultChecked={article.published}
        />
        <Interrupteur
          name="isNew"
          label="Badge « Nouveauté »"
          description="Met l’article en avant avec un badge sur sa photo."
          defaultChecked={article.isNew}
        />
      </Carte>

      <Carte
        titre="Promotion"
        description="Le prix promo remplace le prix sur le site, l’ancien prix barré, avec un badge « Promo ». Laissez vide sans promotion."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Champ id={ident("promoPrice")} label="Prix promo (FCFA)" erreur={e.promoPrice}>
            <input
              id={ident("promoPrice")}
              name="promoPrice"
              inputMode="numeric"
              value={promo}
              onChange={(ev) => setPromo(ev.target.value)}
              placeholder="Ex. 1 200"
              className={`${styleChamp} prix`}
              {...propsErreur(ident("promoPrice"), e.promoPrice)}
            />
          </Champ>
          <Champ
            id={ident("promoEndsAt")}
            label="Dernier jour (facultatif)"
            aide="La promotion s’arrête seule le soir de ce jour."
            erreur={e.promoEndsAt}
          >
            <input
              id={ident("promoEndsAt")}
              name="promoEndsAt"
              type="date"
              value={finPromo}
              onChange={(ev) => setFinPromo(ev.target.value)}
              className={styleChamp}
              {...propsErreur(ident("promoEndsAt"), e.promoEndsAt)}
            />
          </Champ>
        </div>
        {promoValide && (
          <p className="rounded-xl bg-sable/70 px-4 py-3 text-sm">
            Sur le site : <span className="prix font-medium text-rubis">{formatPrice(montantPromo)}</span> au lieu de{" "}
            <s className="prix">{formatPrice(montantPrix)}</s>, soit −{discountPercent(montantPromo, montantPrix)} %
            {finPromo ? `, jusqu’au ${formatPromoEnd(`${finPromo}T12:00:00Z`)} inclus.` : ", jusqu’à ce que vous la retiriez."}
          </p>
        )}
        {(promo || finPromo) && (
          <button
            type="button"
            onClick={() => {
              setPromo("");
              setFinPromo("");
            }}
            className="text-sm text-douce underline underline-offset-4 hover:text-encre"
          >
            Retirer la promotion
          </button>
        )}
      </Carte>

      <Carte
        titre="Choix proposé au client"
        description="Facultatif : par exemple « Coloris » avec Doré, Argenté… Chaque valeur peut montrer sa propre photo."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Champ id={ident("optionName")} label="Nom du choix" aide="Coloris, Finition, Taille…" erreur={e.optionName}>
            <input
              id={ident("optionName")}
              name="optionName"
              value={optionName}
              maxLength={40}
              onChange={(ev) => {
                setOptionName(ev.target.value);
                if (!pluralSaisi) {
                  const mot = ev.target.value.toLowerCase();
                  setOptionPlural(mot && (/[sxz]$/.test(mot) ? mot : `${mot}s`));
                }
              }}
              className={styleChamp}
              {...propsErreur(ident("optionName"), e.optionName)}
            />
          </Champ>
          <Champ id={ident("optionPlural")} label="Au pluriel" aide="Pour afficher « 5 coloris au choix »." erreur={e.optionPlural}>
            <input
              id={ident("optionPlural")}
              name="optionPlural"
              value={optionPlural}
              maxLength={40}
              onChange={(ev) => {
                setOptionPlural(ev.target.value);
                setPluralSaisi(true);
              }}
              className={styleChamp}
              {...propsErreur(ident("optionPlural"), e.optionPlural)}
            />
          </Champ>
        </div>

        <fieldset>
          <legend className="text-sm font-medium">Valeurs proposées</legend>
          {variantes.length > 0 && (
            <ul className="mt-2 space-y-3">
              {variantes.map((v, i) => {
                const nomValeur = v.label || `valeur ${i + 1}`;
                return (
                  <li key={v.cle} className="rounded-xl border border-filet p-3">
                    <div className="flex gap-2">
                      <input
                        aria-label={`Nom de la valeur ${i + 1}`}
                        value={v.label}
                        maxLength={40}
                        placeholder="Ex. Doré"
                        onChange={(ev) => changerVariante(v.cle, { label: ev.target.value })}
                        className={styleChamp}
                      />
                      <button
                        type="button"
                        onClick={() => setVariantes((liste) => liste.filter((x) => x.cle !== v.cle))}
                        aria-label={`Retirer « ${nomValeur} »`}
                        className="grid size-12.5 shrink-0 place-items-center rounded-xl text-douce transition-colors hover:bg-rubis/8 hover:text-rubis"
                      >
                        <Trash2 size={18} aria-hidden />
                      </button>
                    </div>
                    {photos.length > 0 && (
                      <div
                        role="radiogroup"
                        aria-label={`Photo montrée pour « ${nomValeur} »`}
                        className="mt-2.5 flex gap-2 overflow-x-auto p-1"
                      >
                        {[null, ...photos].map((p, n) => {
                          const choisie = p ? v.photo === p.url : !photos.some((x) => x.url === v.photo);
                          return (
                            <label
                              key={p?.url ?? "aucune"}
                              className={`relative grid size-12 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-lg border text-[0.65rem] text-douce has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-or ${
                                choisie ? "border-or ring-2 ring-or" : "border-filet opacity-70 hover:opacity-100"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`photo-${v.cle}`}
                                checked={choisie}
                                onChange={() => changerVariante(v.cle, { photo: p?.url ?? null })}
                                className="sr-only"
                              />
                              {p ? (
                                <>
                                  <Image src={p.url} alt="" fill sizes="48px" className="object-cover" />
                                  <span className="sr-only">Photo {n}</span>
                                </>
                              ) : (
                                "Aucune"
                              )}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          {e.variantes && <p className="mt-2 text-sm text-rubis">{e.variantes}</p>}
          <button
            type="button"
            onClick={() => setVariantes((liste) => [...liste, { label: "", photo: null, cle: crypto.randomUUID() }])}
            className="mt-3 inline-flex h-11 items-center gap-2 rounded-xl border border-dashed border-encre/25 px-4 text-sm transition-colors hover:border-or hover:text-or-fonce"
          >
            <Plus size={16} aria-hidden /> Ajouter une valeur
          </button>
        </fieldset>
      </Carte>

      <BarreEnregistrement etat={etat} enCours={enCours} retour="/admin/articles" bloque={envoiPhotos}>
        {enCours ? "Enregistrement…" : envoiPhotos ? "Envoi des photos…" : nouveau ? "Ajouter l’article" : "Enregistrer"}
      </BarreEnregistrement>
    </form>
  );
}
