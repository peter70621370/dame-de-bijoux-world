import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { BoutonSupprimer } from "@/components/admin/BoutonSupprimer";
import { NouvelleVisite } from "@/components/admin/NouvelleVisite";
import { EnTete } from "@/components/admin/ui";
import { enregistrerArticle, supprimerArticle } from "@/lib/actions/articles";
import { getArticle, getChoixCategories } from "@/lib/data/admin";
import { isPromoActive } from "@/lib/products";
import { FormulaireArticle } from "../FormulaireArticle";

export const metadata: Metadata = {
  title: "Modifier un article",
};

export default async function ArticlePage({ params }: PageProps<"/admin/articles/[id]">) {
  const { id } = await params;
  const [produit, categories] = await Promise.all([getArticle(id), getChoixCategories()]);
  if (!produit) notFound();

  const visible = produit.published && produit.images.length > 0;
  const promoEnCours = isPromoActive(produit);

  return (
    <div className="space-y-6 md:space-y-8">
      <EnTete
        retour={{ href: "/admin/articles", label: "Articles" }}
        surtitre={visible ? "En ligne" : "Masqué du site"}
        titre={produit.name}
        action={
          visible && (
            <a
              href={`/selection/${produit.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bouton bouton-contour w-full sm:w-auto"
            >
              <ExternalLink size={16} aria-hidden /> Voir sur le site
            </a>
          )
        }
      />

      <NouvelleVisite>
        <FormulaireArticle
          nouveau={false}
          categories={categories}
          action={enregistrerArticle.bind(null, produit.id)}
          article={{
            name: produit.name,
            categoryId: produit.categoryId,
            price: String(produit.price),
            short: produit.short,
            description: produit.description,
            details: produit.details.join("\n"),
            published: produit.published,
            isNew: produit.isNew,
            photos: produit.images.map((i) => ({ url: i.url, alt: i.alt })),
            optionName: produit.optionName ?? "",
            optionPlural: produit.optionPlural ?? "",
            variantes: produit.variants.map((v) => ({
              label: v.label,
              photo: produit.images.find((i) => i.id === v.imageId)?.url ?? null,
            })),
            // Une promotion terminée n'est pas reprise : l'enregistrement la retire de la fiche.
            promoPrice: promoEnCours ? String(produit.promoPrice) : "",
            promoEndsAt: promoEnCours ? (produit.promoEndsAt?.toISOString().slice(0, 10) ?? "") : "",
            version: produit.updatedAt.toISOString(),
          }}
        />
      </NouvelleVisite>

      <section className="mx-auto max-w-3xl border-t border-filet pt-6">
        <BoutonSupprimer
          action={supprimerArticle.bind(null, produit.id)}
          libelle="Supprimer l’article"
          titre="Supprimer cet article ?"
          message={`« ${produit.name} » et ses photos seront effacés du site et du back-office. C’est définitif : pour le retirer seulement un temps, décochez plutôt « En ligne ».`}
        />
      </section>
    </div>
  );
}
