"use client";

import Image from "next/image";
import Link from "next/link";
import { startTransition, useActionState, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { ImageOff } from "lucide-react";
import { Carte, Champ, propsErreur, styleChamp } from "@/components/admin/ui";
import type { EtatFormulaire } from "@/lib/actions/formulaires";
import { discountPercent, formatPrice, formatPromoEnd } from "@/lib/products";

export type ArticlePromo = {
  id: string;
  name: string;
  price: number;
  categoryLabel: string;
  visible: boolean;
  photo?: string;
};

const REMISES = [10, 20, 30, 50];

const enNombre = (texte: string) => Number(texte.replace(/[^\d]/g, "")) || 0;

/** Prix après remise, arrondi aux 25 F les plus proches pour faciliter la monnaie. */
const apresRemise = (prix: number, remise: number) => Math.round((prix * (100 - remise)) / 100 / 25) * 25;

export function FormulairePromotion({
  articles,
  promo,
  aujourdhui,
  action,
  nouvelle,
}: {
  /** Articles proposés (nouvelle promotion), ou l'article dont on modifie la promotion. */
  articles: ArticlePromo[];
  promo: { productId: string; promoPrice: string; promoEndsAt: string };
  /** Date du jour (AAAA-MM-JJ) : on ne peut pas choisir un dernier jour déjà passé. */
  aujourdhui: string;
  action: (etat: EtatFormulaire, formData: FormData) => Promise<EtatFormulaire>;
  nouvelle: boolean;
}) {
  const [etat, envoyer, enCours] = useActionState(action, undefined);
  const formulaire = useRef<HTMLFormElement>(null);
  // Next.js garde les pages déjà visitées dans le document, masquées : chaque formulaire a ses propres identifiants.
  const uid = useId();
  const ident = (nom: string) => `${uid}${nom}`;
  const [productId, setProductId] = useState(promo.productId);
  const [prixPromo, setPrixPromo] = useState(promo.promoPrice);
  const [fin, setFin] = useState(promo.promoEndsAt);
  const e = etat?.erreurs ?? {};
  const article = articles.find((a) => a.id === productId);

  // Après un refus, amène la personne au premier champ à corriger.
  useEffect(() => {
    if (etat?.erreurs) formulaire.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
  }, [etat]);

  function soumettre(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const donnees = new FormData(evenement.currentTarget);
    startTransition(() => envoyer(donnees));
  }

  // Les articles arrivent triés par catégorie : on les regroupe dans la liste déroulante.
  const groupes: { label: string; articles: ArticlePromo[] }[] = [];
  for (const a of articles) {
    const dernier = groupes.at(-1);
    if (dernier?.label === a.categoryLabel) dernier.articles.push(a);
    else groupes.push({ label: a.categoryLabel, articles: [a] });
  }

  const montant = enNombre(prixPromo);
  const apercu = article && montant > 0 && montant < article.price;

  return (
    <form ref={formulaire} onSubmit={soumettre} noValidate className="mx-auto max-w-3xl space-y-5">
      <Carte titre="Article">
        {nouvelle ? (
          <Champ id={ident("productId")} label="Article en promotion" erreur={e.productId}>
            <select
              id={ident("productId")}
              name="productId"
              value={productId}
              onChange={(ev) => setProductId(ev.target.value)}
              className={styleChamp}
              {...propsErreur(ident("productId"), e.productId)}
            >
              <option value="" disabled>
                Choisir un article…
              </option>
              {groupes.map((g) => (
                <optgroup key={g.label} label={g.label}>
                  {g.articles.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} · {formatPrice(a.price)}
                      {a.visible ? "" : " (masqué)"}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <input type="hidden" name="nouvelle" value="1" />
          </Champ>
        ) : (
          <input type="hidden" name="productId" value={productId} />
        )}
        {article && (
          <div className="flex items-center gap-3 rounded-xl bg-sable/60 p-3">
            <span className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-sable text-douce">
              {article.photo ? (
                <Image src={article.photo} alt="" fill sizes="56px" className="object-cover" />
              ) : (
                <ImageOff size={18} aria-hidden />
              )}
            </span>
            <span className="min-w-0 text-sm">
              <span className="block truncate text-base font-medium">{article.name}</span>
              <span className="block text-douce">
                {article.categoryLabel} · prix habituel <span className="prix">{formatPrice(article.price)}</span>
              </span>
              {!article.visible && (
                <span className="mt-1 block text-rubis">
                  Article masqué du site : la promotion ne se verra qu’une fois l’article en ligne.
                </span>
              )}
            </span>
          </div>
        )}
      </Carte>

      <Carte titre="Prix et durée">
        <Champ id={ident("promoPrice")} label="Prix promo (FCFA)" erreur={e.promoPrice}>
          <input
            id={ident("promoPrice")}
            name="promoPrice"
            inputMode="numeric"
            value={prixPromo}
            onChange={(ev) => setPrixPromo(ev.target.value)}
            placeholder="Ex. 1 200"
            className={`${styleChamp} prix sm:max-w-60`}
            {...propsErreur(ident("promoPrice"), e.promoPrice)}
          />
          {article && (
            <div role="group" aria-label="Remise rapide" className="mt-2.5 flex flex-wrap gap-2">
              {REMISES.map((remise) => {
                const prix = apresRemise(article.price, remise);
                return (
                  <button
                    key={remise}
                    type="button"
                    aria-pressed={montant === prix}
                    onClick={() => setPrixPromo(String(prix))}
                    className={`prix h-9 rounded-full border px-4 text-sm transition-colors ${
                      montant === prix ? "border-nuit bg-nuit text-ivoire" : "border-filet bg-white hover:border-encre/40"
                    }`}
                  >
                    −{remise} %
                  </button>
                );
              })}
            </div>
          )}
        </Champ>
        <Champ
          id={ident("promoEndsAt")}
          label="Dernier jour (facultatif)"
          aide="La promotion s’arrête seule le soir de ce jour. Sans date, elle dure jusqu’à ce que vous l’arrêtiez."
          erreur={e.promoEndsAt}
        >
          <input
            id={ident("promoEndsAt")}
            name="promoEndsAt"
            type="date"
            min={aujourdhui}
            value={fin}
            onChange={(ev) => setFin(ev.target.value)}
            className={`${styleChamp} sm:max-w-60`}
            {...propsErreur(ident("promoEndsAt"), e.promoEndsAt)}
          />
        </Champ>
        {apercu && (
          <p className="rounded-xl bg-sable/70 px-4 py-3 text-sm">
            Sur le site : <span className="prix font-medium text-rubis">{formatPrice(montant)}</span> au lieu de{" "}
            <s className="prix">{formatPrice(article.price)}</s>, soit −{discountPercent(montant, article.price)} %
            {fin ? `, jusqu’au ${formatPromoEnd(`${fin}T12:00:00Z`)} inclus.` : ", jusqu’à ce que vous l’arrêtiez."}
          </p>
        )}
      </Carte>

      <div className="sticky bottom-0 z-10 -mx-4 border-t border-filet bg-ivoire/95 px-4 py-3 backdrop-blur-md md:-mx-8 md:px-8">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-end gap-x-3 gap-y-2">
          {etat?.message && !enCours && (
            <p role="alert" className="w-full text-sm text-rubis sm:mr-auto sm:w-auto">
              {etat.message}
            </p>
          )}
          <Link href="/admin/promotions" className="bouton bouton-contour flex-1 px-4 sm:flex-none sm:px-7">
            Retour
          </Link>
          <button type="submit" disabled={enCours} className="bouton bouton-nuit flex-[2] px-4 sm:flex-none sm:px-7">
            {enCours ? "Enregistrement…" : nouvelle ? "Lancer la promotion" : "Enregistrer"}
          </button>
        </div>
      </div>
    </form>
  );
}
