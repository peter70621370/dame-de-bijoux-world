"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ImageOff, Search } from "lucide-react";
import { BasculeEnLigne } from "@/components/admin/BasculeEnLigne";
import { Pastille, styleChamp } from "@/components/admin/ui";
import { discountPercent, formatPrice } from "@/lib/products";

export type ArticleListe = {
  id: string;
  name: string;
  categoryId: string;
  categoryLabel: string;
  price: number;
  /** Prix promo en cours, sinon null. */
  promoPrice: number | null;
  published: boolean;
  isNew: boolean;
  photo?: string;
  photos: number;
};

const FILTRES = [
  { id: "tous", label: "Tous", garde: () => true },
  { id: "en-ligne", label: "En ligne", garde: (a: ArticleListe) => a.published && a.photos > 0 },
  { id: "masques", label: "Masqués", garde: (a: ArticleListe) => !a.published || a.photos === 0 },
  { id: "promo", label: "En promo", garde: (a: ArticleListe) => a.promoPrice !== null },
  { id: "nouveautes", label: "Nouveautés", garde: (a: ArticleListe) => a.isNew },
] as const;

const sansAccents = (texte: string) =>
  texte
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

export function ListeArticles({
  articles,
  categories,
  categorie: categorieInitiale = "",
}: {
  articles: ArticleListe[];
  categories: { id: string; label: string }[];
  categorie?: string;
}) {
  const [recherche, setRecherche] = useState("");
  const [categorie, setCategorie] = useState(categorieInitiale);
  const [filtre, setFiltre] = useState<(typeof FILTRES)[number]["id"]>("tous");

  const mots = sansAccents(recherche).split(/\s+/).filter(Boolean);
  // Les compteurs des filtres portent sur la catégorie et la recherche en cours.
  const correspondants = articles.filter(
    (a) =>
      (!categorie || a.categoryId === categorie) &&
      mots.every((mot) => sansAccents(`${a.name} ${a.categoryLabel}`).includes(mot)),
  );
  const visibles = correspondants.filter(FILTRES.find((f) => f.id === filtre)!.garde);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Rechercher un article</span>
          <Search size={18} aria-hidden className="absolute top-1/2 left-3.5 -translate-y-1/2 text-douce" />
          <input
            type="search"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un article"
            className={`${styleChamp} pl-11`}
          />
        </label>
        <select
          aria-label="Catégorie"
          value={categorie}
          onChange={(e) => setCategorie(e.target.value)}
          className={`${styleChamp} sm:w-60`}
        >
          <option value="">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div role="group" aria-label="Afficher" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
        {FILTRES.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filtre === f.id}
            onClick={() => setFiltre(f.id)}
            className={`h-9 shrink-0 rounded-full border px-4 text-sm transition-colors ${
              filtre === f.id ? "border-nuit bg-nuit text-ivoire" : "border-filet bg-white hover:border-encre/40"
            }`}
          >
            {f.label} <span className="prix opacity-60">{correspondants.filter(f.garde).length}</span>
          </button>
        ))}
      </div>

      {visibles.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-filet px-5 py-10 text-center text-sm text-douce">
          {articles.length === 0 ? "Aucun article pour l’instant." : "Aucun article ne correspond à ces critères."}
        </p>
      ) : (
        <ul className="divide-y divide-filet overflow-hidden rounded-2xl border border-filet bg-white">
          {visibles.map((a) => (
            <li key={a.id} className="flex items-center gap-2 py-3 pr-3 pl-3 md:gap-4 md:px-5">
              <Link
                href={`/admin/articles/${a.id}`}
                className="flex min-w-0 flex-1 items-center gap-3 rounded-xl md:gap-4"
              >
                <span className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-sable text-douce">
                  {a.photo ? (
                    <Image src={a.photo} alt="" fill sizes="64px" className="object-cover" />
                  ) : (
                    <ImageOff size={20} aria-hidden />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{a.name}</span>
                  <span className="mt-0.5 block truncate text-sm text-douce">
                    {a.categoryLabel} ·{" "}
                    {a.promoPrice !== null ? (
                      <>
                        <span className="prix text-rubis">{formatPrice(a.promoPrice)}</span>{" "}
                        <s className="prix">{formatPrice(a.price)}</s>
                      </>
                    ) : (
                      <span className="prix">{formatPrice(a.price)}</span>
                    )}
                  </span>
                  {(a.photos === 0 || a.isNew || a.promoPrice !== null) && (
                    <span className="mt-1.5 flex flex-wrap gap-1.5">
                      {a.photos === 0 && <Pastille ton="rubis">Sans photo</Pastille>}
                      {a.promoPrice !== null && (
                        <Pastille ton="or">Promo −{discountPercent(a.promoPrice, a.price)} %</Pastille>
                      )}
                      {a.isNew && <Pastille ton="rubis">Nouveauté</Pastille>}
                    </span>
                  )}
                </span>
              </Link>
              <BasculeEnLigne id={a.id} nom={a.name} enLigne={a.published} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
