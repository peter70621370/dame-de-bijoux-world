import type { Metadata } from "next";
import Link from "next/link";
import { NouvelleVisite } from "@/components/admin/NouvelleVisite";
import { EnTete } from "@/components/admin/ui";
import { enregistrerArticle } from "@/lib/actions/articles";
import { getChoixCategories } from "@/lib/data/admin";
import { FormulaireArticle } from "../FormulaireArticle";

export const metadata: Metadata = {
  title: "Nouvel article",
};

export default async function NouvelArticlePage() {
  const categories = await getChoixCategories();

  return (
    <div className="space-y-6 md:space-y-8">
      <EnTete retour={{ href: "/admin/articles", label: "Articles" }} surtitre="Catalogue" titre="Nouvel article" />
      {categories.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-filet px-5 py-10 text-center text-sm text-douce">
          Créez d’abord une{" "}
          <Link href="/admin/categories/nouvelle" className="underline">
            catégorie
          </Link>{" "}
          pour y ranger l’article.
        </p>
      ) : (
        <NouvelleVisite>
          <FormulaireArticle
            nouveau
            categories={categories}
            action={enregistrerArticle.bind(null, null)}
            article={{
              name: "",
              categoryId: categories[0].id,
              price: "",
              short: "",
              description: "",
              details: "",
              published: true,
              isNew: true,
              photos: [],
              optionName: "",
              optionPlural: "",
              variantes: [],
              promoPrice: "",
              promoEndsAt: "",
              version: "",
            }}
          />
        </NouvelleVisite>
      )}
    </div>
  );
}
