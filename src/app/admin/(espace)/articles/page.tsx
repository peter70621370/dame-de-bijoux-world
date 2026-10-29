import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Avis, EnTete } from "@/components/admin/ui";
import { getArticles, getChoixCategories } from "@/lib/data/admin";
import { ListeArticles } from "./ListeArticles";

export const metadata: Metadata = {
  title: "Articles",
};

export default async function ArticlesPage({ searchParams }: PageProps<"/admin/articles">) {
  const [{ ajout, suppression, categorie }, articles, categories] = await Promise.all([
    searchParams,
    getArticles(),
    getChoixCategories(),
  ]);
  const ajoute = articles.find((a) => a.id === ajout);
  // Lien « Voir ses articles » depuis une catégorie : la liste s'ouvre filtrée sur elle.
  const categorieChoisie = categories.find((c) => c.id === categorie)?.id ?? "";
  const masques = articles.filter((a) => !a.published || a.photos === 0).length;

  return (
    <div className="space-y-6 md:space-y-8">
      <EnTete
        surtitre="Catalogue"
        titre="Articles"
        description={`${articles.length} article${articles.length > 1 ? "s" : ""}${
          masques > 0 ? `, dont ${masques} masqué${masques > 1 ? "s" : ""} du site` : ", tous visibles sur le site"
        }`}
        action={
          <Link href="/admin/articles/nouveau" className="bouton bouton-nuit w-full sm:w-auto">
            <Plus size={16} aria-hidden /> Nouvel article
          </Link>
        }
      />

      {ajoute && (
        <Avis>
          L’article « {ajoute.name} » est enregistré
          {ajoute.published && ajoute.photos > 0 ? (
            <>
              {" "}et visible sur le site.{" "}
              <a href={`/selection/${ajoute.slug}`} target="_blank" rel="noopener noreferrer" className="underline">
                Voir la fiche
              </a>
            </>
          ) : (
            ", mais masqué du site."
          )}
        </Avis>
      )}
      {suppression && <Avis>L’article a été supprimé.</Avis>}

      <ListeArticles key={categorieChoisie} articles={articles} categories={categories} categorie={categorieChoisie} />
    </div>
  );
}
