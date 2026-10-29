import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { BoutonSupprimer } from "@/components/admin/BoutonSupprimer";
import { NouvelleVisite } from "@/components/admin/NouvelleVisite";
import { EnTete } from "@/components/admin/ui";
import { enregistrerActualite, supprimerActualite } from "@/lib/actions/actualites";
import { getActualite, getChoixArticles } from "@/lib/data/admin";
import { aujourdhui, jourDe } from "@/lib/dates";
import { FormulaireActualite } from "../FormulaireActualite";

export const metadata: Metadata = {
  title: "Modifier une actualité",
};

export default async function ActualitePage({ params }: PageProps<"/admin/actualites/[id]">) {
  const { id } = await params;
  const [post, articles] = await Promise.all([getActualite(id), getChoixArticles()]);
  if (!post) notFound();

  return (
    <div className="space-y-6 md:space-y-8">
      <EnTete
        retour={{ href: "/admin/actualites", label: "Actualités" }}
        surtitre={post.published ? "En ligne" : "Brouillon"}
        titre={post.title}
        action={
          post.published && (
            <a
              href={`/actualites/${post.slug}`}
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
        <FormulaireActualite
          nouvelle={false}
          articles={articles}
          aujourdhui={aujourdhui()}
          action={enregistrerActualite.bind(null, post.id)}
          actualite={{
            title: post.title,
            excerpt: post.excerpt,
            body: post.body,
            image: post.image ?? "",
            published: post.published,
            publishedAt: jourDe(post.publishedAt),
            articles: post.products.map((p) => p.id),
            version: post.updatedAt.toISOString(),
          }}
        />
      </NouvelleVisite>

      <section className="mx-auto max-w-3xl border-t border-filet pt-6">
        <BoutonSupprimer
          action={supprimerActualite.bind(null, post.id)}
          libelle="Supprimer l’actualité"
          titre="Supprimer cette actualité ?"
          message={`« ${post.title} »${post.image ? " et sa photo seront effacées" : " sera effacée"} du site et du back-office. C’est définitif : pour la retirer seulement du site, décochez plutôt « En ligne ».`}
        />
      </section>
    </div>
  );
}
