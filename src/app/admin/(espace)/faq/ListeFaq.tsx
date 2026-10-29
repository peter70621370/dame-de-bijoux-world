"use client";

import Link from "next/link";
import { startTransition, useOptimistic, useState } from "react";
import { ChevronDown, ChevronUp, Pencil, Plus } from "lucide-react";
import { Pastille } from "@/components/admin/ui";
import { deplacerQuestion, deplacerRubrique } from "@/lib/actions/faq";

export type RubriqueListe = {
  id: string;
  title: string;
  questions: { id: string; question: string; onHome: boolean }[];
};

type Deplacement = { id: string; sens: -1 | 1 };

function echanger<T extends { id: string }>(liste: T[], { id, sens }: Deplacement) {
  const i = liste.findIndex((x) => x.id === id);
  if (i < 0 || !liste[i + sens]) return liste;
  const copie = [...liste];
  [copie[i], copie[i + sens]] = [copie[i + sens], copie[i]];
  return copie;
}

function deplacer(rubriques: RubriqueListe[], d: Deplacement & { rubrique?: string }) {
  if (!d.rubrique) return echanger(rubriques, d);
  return rubriques.map((r) => (r.id === d.rubrique ? { ...r, questions: echanger(r.questions, d) } : r));
}

/** Rubriques et questions dans l'ordre de la page FAQ ; les flèches changent cet ordre tout de suite, puis l'enregistrent. */
export function ListeFaq({ rubriques }: { rubriques: RubriqueListe[] }) {
  const [liste, deplacerAffiche] = useOptimistic(rubriques, deplacer);
  const [annonce, setAnnonce] = useState("");

  function bougerRubrique(r: RubriqueListe, sens: -1 | 1) {
    const rang = liste.findIndex((x) => x.id === r.id) + 1 + sens;
    setAnnonce(`Rubrique « ${r.title} » placée en position ${rang} sur ${liste.length}.`);
    startTransition(async () => {
      deplacerAffiche({ id: r.id, sens });
      await deplacerRubrique(r.id, sens);
    });
  }

  function bougerQuestion(r: RubriqueListe, q: RubriqueListe["questions"][number], sens: -1 | 1) {
    const rang = r.questions.findIndex((x) => x.id === q.id) + 1 + sens;
    setAnnonce(`« ${q.question} » placée en position ${rang} sur ${r.questions.length}.`);
    startTransition(async () => {
      deplacerAffiche({ id: q.id, sens, rubrique: r.id });
      await deplacerQuestion(q.id, sens);
    });
  }

  if (liste.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-filet px-5 py-10 text-center text-sm text-douce">
        Aucune rubrique pour l’instant : créez-en une, puis ajoutez-y vos questions.
      </p>
    );
  }

  return (
    <>
      <div className="space-y-5">
        {liste.map((r, i) => (
          <section key={r.id} aria-labelledby={`rubrique-${r.id}`} className="overflow-hidden rounded-2xl border border-filet bg-white">
            <header className="flex items-center gap-2 border-b border-filet bg-sable/40 py-2 pr-2 pl-4 md:pl-5">
              <div className="min-w-0 flex-1">
                <h2 id={`rubrique-${r.id}`} className="truncate font-serif text-xl">
                  {r.title}
                </h2>
                <p className="text-xs text-douce">
                  {r.questions.length === 0
                    ? "Vide : n’apparaît pas sur le site"
                    : `${r.questions.length} question${r.questions.length > 1 ? "s" : ""}`}
                </p>
              </div>
              <Link
                href={`/admin/faq/rubriques/${r.id}`}
                aria-label={`Renommer ou supprimer la rubrique « ${r.title} »`}
                className="grid size-10 place-items-center rounded-lg text-douce transition-colors hover:bg-white hover:text-encre"
              >
                <Pencil size={18} aria-hidden />
              </Link>
              <Fleches
                nom={`la rubrique « ${r.title} »`}
                haut={i > 0}
                bas={i < liste.length - 1}
                onBouger={(sens) => bougerRubrique(r, sens)}
              />
            </header>

            {r.questions.length > 0 && (
              <ul className="divide-y divide-filet">
                {r.questions.map((q, j) => (
                  <li key={q.id} className="flex items-center gap-2 py-2 pr-2 pl-4 md:pl-5">
                    <Link href={`/admin/faq/${q.id}`} className="min-w-0 flex-1 py-1.5">
                      <span className="line-clamp-2 font-medium leading-snug">{q.question}</span>
                      {q.onHome && (
                        <span className="mt-1.5 flex">
                          <Pastille ton="or">Sur l’accueil</Pastille>
                        </span>
                      )}
                    </Link>
                    <Fleches
                      nom={`« ${q.question} »`}
                      haut={j > 0}
                      bas={j < r.questions.length - 1}
                      onBouger={(sens) => bougerQuestion(r, q, sens)}
                    />
                  </li>
                ))}
              </ul>
            )}

            <Link
              href={`/admin/faq/nouvelle?rubrique=${r.id}`}
              className="flex min-h-12 items-center gap-2 border-t border-filet px-4 text-sm font-medium text-or-fonce transition-colors hover:bg-sable/40 md:px-5"
            >
              <Plus size={16} aria-hidden /> Ajouter une question
            </Link>
          </section>
        ))}
      </div>
      <p role="status" className="sr-only">
        {annonce}
      </p>
    </>
  );
}

function Fleches({
  nom,
  haut,
  bas,
  onBouger,
}: {
  nom: string;
  haut: boolean;
  bas: boolean;
  onBouger: (sens: -1 | 1) => void;
}) {
  const style =
    "grid size-10 place-items-center rounded-lg text-douce transition-colors hover:bg-sable hover:text-encre disabled:opacity-25 disabled:hover:bg-transparent";
  return (
    <div className="flex shrink-0 flex-col">
      <button type="button" onClick={() => onBouger(-1)} disabled={!haut} aria-label={`Monter ${nom}`} className={style}>
        <ChevronUp size={20} aria-hidden />
      </button>
      <button type="button" onClick={() => onBouger(1)} disabled={!bas} aria-label={`Descendre ${nom}`} className={style}>
        <ChevronDown size={20} aria-hidden />
      </button>
    </div>
  );
}
