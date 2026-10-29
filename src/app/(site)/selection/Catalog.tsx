"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useBoutique } from "@/components/BoutiqueProvider";
import { ProductCard } from "@/components/ProductCard";
import { IconClose, IconSearch, IconWhatsApp } from "@/components/icons";
import type { Category, Product } from "@/lib/products";
import { site } from "@/lib/site";
import { whatsappUrl } from "@/lib/whatsapp";

const sorts = {
  pertinence: "Nouveautés d’abord",
  "prix-croissant": "Prix croissant",
  "prix-decroissant": "Prix décroissant",
} as const;
type SortKey = keyof typeof sorts;

/** Minuscules, sans accents ni ponctuation : « Chaînes dorées » → « chaines dorees ». */
function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ");
}

/** Mots de la recherche, au singulier approximatif pour que « bagues » trouve « bague ». */
function terms(query: string) {
  return normalize(query)
    .split(" ")
    .filter((w) => w.length > 1)
    .map((w) => (w.length > 3 ? w.replace(/[sx]$/, "") : w));
}

/** Texte cherchable d'une fiche : nom, descriptions, catégorie, choix proposés et promotion en cours. */
function searchableText(p: Product) {
  const parts = [
    p.name,
    p.short,
    p.description,
    ...p.details,
    p.categoryLabel,
    p.categoryTag,
    ...(p.option?.values.map((v) => v.label) ?? []),
    p.regularPrice ? "promo promotion soldes" : "",
  ];
  return normalize(parts.join(" "));
}

/** Catégories sur demande évoquées par la recherche (« bague dorée » → Bagues). */
function requestedCategories(categories: Category[], words: string[]): Category[] {
  return categories.filter((c) => {
    const text = normalize(`${c.label} ${c.tag}`);
    return c.onRequest && words.some((w) => w.length > 2 && text.includes(w));
  });
}

export function Catalog({ products, categories }: { products: Product[]; categories: Category[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const boutique = useBoutique();

  const sort: SortKey = (params.get("tri") as SortKey) in sorts ? (params.get("tri") as SortKey) : "pertinence";

  // Les liens de l'accueil et du pied de page arrivent avec ?categorie= : on préremplit la recherche.
  const fromUrl = params.get("q") ?? categories.find((c) => c.id === params.get("categorie"))?.label ?? "";
  const [query, setQuery] = useState(fromUrl);
  const [lastFromUrl, setLastFromUrl] = useState(fromUrl);
  if (fromUrl !== lastFromUrl) {
    setLastFromUrl(fromUrl);
    setQuery(fromUrl);
  }

  function search(value: string) {
    setQuery(value);
    // Historique natif : l'adresse suit la saisie sans recharger la page à chaque lettre.
    const next = new URLSearchParams(window.location.search);
    next.delete("categorie");
    if (value.trim()) next.set("q", value);
    else next.delete("q");
    const qs = next.toString();
    window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
  }

  function updateSort(value: SortKey) {
    const next = new URLSearchParams(params);
    if (value === "pertinence") next.delete("tri");
    else next.set("tri", value);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const words = useMemo(() => terms(query), [query]);
  const texts = useMemo(() => new Map(products.map((p) => [p.slug, searchableText(p)])), [products]);

  const visible = useMemo(() => {
    const list = products.filter((p) => words.every((w) => texts.get(p.slug)!.includes(w)));
    if (sort === "prix-croissant") return [...list].sort((a, b) => a.price - b.price);
    if (sort === "prix-decroissant") return [...list].sort((a, b) => b.price - a.price);
    return [...list].sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
  }, [products, texts, words, sort]);

  const onRequest = visible.length === 0 ? requestedCategories(categories, words) : [];
  const trimmed = query.trim();

  return (
    <section className="conteneur py-10 md:py-14">
      <div className="flex flex-col gap-4 border-b border-filet pb-6 sm:flex-row sm:items-center sm:justify-between">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            // Ferme le clavier du téléphone : les résultats sont déjà à jour.
            (document.activeElement as HTMLElement | null)?.blur();
          }}
          className="relative w-full sm:max-w-md"
        >
          <IconSearch
            width={18}
            height={18}
            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-douce"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => search(e.target.value)}
            placeholder="Rechercher : bracelet, ceinture, doré…"
            aria-label="Rechercher un article"
            enterKeyHint="search"
            autoComplete="off"
            className="h-12 w-full rounded-xl border border-filet bg-white pr-12 pl-11 text-[0.95rem] text-encre shadow-sm outline-none transition-colors placeholder:text-douce/80 focus:border-or [&::-webkit-search-cancel-button]:appearance-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => search("")}
              aria-label="Effacer la recherche"
              className="absolute top-1/2 right-1.5 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-douce hover:text-encre"
            >
              <IconClose width={16} height={16} />
            </button>
          )}
        </form>
        <label className="flex shrink-0 items-center gap-3 text-sm text-douce">
          Trier
          <select
            value={sort}
            onChange={(e) => updateSort(e.target.value as SortKey)}
            className="h-10 rounded-xl border border-filet bg-ivoire px-3 text-encre outline-none focus:border-or"
          >
            {Object.entries(sorts).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-6 text-sm text-douce" aria-live="polite">
        {visible.length > 0
          ? `${visible.length} article${visible.length > 1 ? "s" : ""}${trimmed ? ` pour « ${trimmed} »` : ""}`
          : null}
      </p>

      {visible.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((p, i) => (
            <div key={p.slug} className="animate-monte" style={{ animationDelay: `${i * 60}ms` }}>
              <ProductCard product={p} priority={i < 2} />
            </div>
          ))}
        </div>
      ) : onRequest.length > 0 ? (
        <div className="mt-6 space-y-4">
          {onRequest.map((c) => (
            <div
              key={c.id}
              className="flex flex-col items-start gap-6 rounded-2xl bg-sable p-8 md:flex-row md:items-center md:justify-between md:p-12"
            >
              <div>
                <p className="eyebrow text-or-fonce">Sur demande</p>
                <p className="titre mt-3 text-4xl">{c.label}</p>
                <p className="mt-3 max-w-lg leading-relaxed text-douce">
                  {c.blurb} Ces pièces ne sont pas encore en ligne : demandez les modèles disponibles, nous vous
                  envoyons photos et prix sur WhatsApp.
                </p>
              </div>
              <a
                href={whatsappUrl(
                  boutique.whatsapp,
                  `Bonjour ${site.name}, je cherche des ${c.label.toLowerCase()}. Pouvez-vous m’envoyer les modèles disponibles et leurs prix ?`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="bouton bouton-whatsapp shrink-0"
              >
                <IconWhatsApp /> Demander les modèles
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 flex flex-col items-start gap-6 rounded-2xl bg-sable p-8 md:flex-row md:items-center md:justify-between md:p-12">
          <div>
            <p className="titre text-4xl">Aucun article en ligne pour « {trimmed} »</p>
            <p className="mt-3 max-w-lg leading-relaxed text-douce">
              Nous l’avons peut-être en boutique : demandez-nous sur WhatsApp, nous vous envoyons photos et prix.
            </p>
          </div>
          <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row md:flex-col lg:flex-row">
            <a
              href={whatsappUrl(boutique.whatsapp, `Bonjour ${site.name}, je cherche « ${trimmed} ». L’avez-vous en boutique ?`)}
              target="_blank"
              rel="noopener noreferrer"
              className="bouton bouton-whatsapp"
            >
              <IconWhatsApp /> Nous demander
            </a>
            <button type="button" onClick={() => search("")} className="bouton bouton-contour">
              Tout afficher
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
