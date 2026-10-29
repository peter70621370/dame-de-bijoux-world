"use client";

import Image from "next/image";
import Link from "next/link";
import { startTransition, useOptimistic, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Pastille } from "@/components/admin/ui";
import { deplacerCategorie } from "@/lib/actions/categories";

export type CategorieListe = {
  id: string;
  label: string;
  onRequest: boolean;
  image?: string;
  articles: number;
  enLigne: number;
};

type Deplacement = { id: string; sens: -1 | 1 };

function deplacer(liste: CategorieListe[], { id, sens }: Deplacement) {
  const i = liste.findIndex((c) => c.id === id);
  if (i < 0 || !liste[i + sens]) return liste;
  const copie = [...liste];
  [copie[i], copie[i + sens]] = [copie[i + sens], copie[i]];
  return copie;
}

/** Catégories dans l'ordre du site ; les flèches changent cet ordre tout de suite, puis l'enregistrent. */
export function ListeCategories({ categories }: { categories: CategorieListe[] }) {
  const [liste, deplacerAffiche] = useOptimistic(categories, deplacer);
  const [annonce, setAnnonce] = useState("");

  function bouger(c: CategorieListe, sens: -1 | 1) {
    const rang = liste.findIndex((x) => x.id === c.id) + 1 + sens;
    setAnnonce(`« ${c.label} » placée en position ${rang} sur ${liste.length}.`);
    startTransition(async () => {
      deplacerAffiche({ id: c.id, sens });
      await deplacerCategorie(c.id, sens);
    });
  }

  if (liste.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-filet px-5 py-10 text-center text-sm text-douce">
        Aucune catégorie pour l’instant.
      </p>
    );
  }

  return (
    <>
      <ul className="divide-y divide-filet overflow-hidden rounded-2xl border border-filet bg-white">
        {liste.map((c, i) => {
          const masques = c.articles - c.enLigne;
          return (
            <li key={c.id} className="flex items-center gap-2 py-3 pr-2 pl-3 md:gap-4 md:px-5">
              <Link
                href={`/admin/categories/${c.id}`}
                className="flex min-w-0 flex-1 items-center gap-3 rounded-xl md:gap-4"
              >
                <span className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-sable font-serif text-3xl text-or-fonce/60">
                  {c.image ? (
                    <Image src={c.image} alt="" fill sizes="64px" className="object-cover" />
                  ) : (
                    <span aria-hidden>{c.label.charAt(0)}</span>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{c.label}</span>
                  <span className="mt-0.5 block truncate text-sm text-douce">
                    {c.articles === 0 ? "Aucun article" : `${c.articles} article${c.articles > 1 ? "s" : ""}`}
                    {masques > 0 && ` · ${masques} masqué${masques > 1 ? "s" : ""}`}
                  </span>
                  {(c.onRequest || c.enLigne === 0) && (
                    <span className="mt-1.5 flex flex-wrap gap-1.5">
                      {c.onRequest ? (
                        <Pastille ton="or">Sur demande</Pastille>
                      ) : (
                        <Pastille ton="rubis">Vide sur le site</Pastille>
                      )}
                    </span>
                  )}
                </span>
              </Link>
              <div className="flex shrink-0 flex-col">
                <button
                  type="button"
                  onClick={() => bouger(c, -1)}
                  disabled={i === 0}
                  aria-label={`Monter « ${c.label} »`}
                  className="grid size-10 place-items-center rounded-lg text-douce transition-colors hover:bg-sable hover:text-encre disabled:opacity-25 disabled:hover:bg-transparent"
                >
                  <ChevronUp size={20} aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => bouger(c, 1)}
                  disabled={i === liste.length - 1}
                  aria-label={`Descendre « ${c.label} »`}
                  className="grid size-10 place-items-center rounded-lg text-douce transition-colors hover:bg-sable hover:text-encre disabled:opacity-25 disabled:hover:bg-transparent"
                >
                  <ChevronDown size={20} aria-hidden />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <p role="status" className="sr-only">
        {annonce}
      </p>
    </>
  );
}
