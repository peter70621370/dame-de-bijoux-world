import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { BoutonSupprimer } from "@/components/admin/BoutonSupprimer";
import { NouvelleVisite } from "@/components/admin/NouvelleVisite";
import { EnTete } from "@/components/admin/ui";
import { enregistrerCategorie, supprimerCategorie } from "@/lib/actions/categories";
import { getCategorie } from "@/lib/data/admin";
import { FormulaireCategorie } from "../FormulaireCategorie";

export const metadata: Metadata = {
  title: "Modifier une catégorie",
};

export default async function CategoriePage({ params }: PageProps<"/admin/categories/[id]">) {
  const { id } = await params;
  const categorie = await getCategorie(id);
  if (!categorie) notFound();

  const articles = categorie._count.products;

  return (
    <div className="space-y-6 md:space-y-8">
      <EnTete
        centre
        retour={{ href: "/admin/categories", label: "Catégories" }}
        surtitre={categorie.onRequest ? "Sur demande" : "Catégorie"}
        titre={categorie.label}
        action={
          <a
            href={`/selection?categorie=${categorie.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bouton bouton-contour w-full sm:w-auto"
          >
            <ExternalLink size={16} aria-hidden /> Voir sur le site
          </a>
        }
      />

      <NouvelleVisite>
        <FormulaireCategorie
          nouvelle={false}
          action={enregistrerCategorie.bind(null, categorie.id)}
          categorie={{
            label: categorie.label,
            tag: categorie.tag,
            blurb: categorie.blurb,
            onRequest: categorie.onRequest,
            image: categorie.image ?? "",
          }}
        />
      </NouvelleVisite>

      <section className="mx-auto max-w-3xl border-t border-filet pt-6">
        {articles > 0 ? (
          <p className="text-sm leading-relaxed text-douce">
            Pour supprimer cette catégorie, rangez d’abord {articles > 1 ? `ses ${articles} articles` : "son article"} dans
            une autre catégorie, ou {articles > 1 ? "supprimez-les" : "supprimez-le"}.{" "}
            <Link href={`/admin/articles?categorie=${categorie.id}`} className="text-encre underline underline-offset-4">
              Voir {articles > 1 ? "ces articles" : "cet article"}
            </Link>
          </p>
        ) : (
          <BoutonSupprimer
            action={supprimerCategorie.bind(null, categorie.id)}
            libelle="Supprimer la catégorie"
            titre="Supprimer cette catégorie ?"
            message={`« ${categorie.label} » disparaîtra de l’accueil et du catalogue. Elle ne contient aucun article.`}
          />
        )}
      </section>
    </div>
  );
}
