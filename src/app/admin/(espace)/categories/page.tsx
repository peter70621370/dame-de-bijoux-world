import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Avis, EnTete } from "@/components/admin/ui";
import { getCategories } from "@/lib/data/admin";
import { ListeCategories } from "./ListeCategories";

export const metadata: Metadata = {
  title: "Catégories",
};

export default async function CategoriesPage({ searchParams }: PageProps<"/admin/categories">) {
  const [{ ajout, suppression }, categories] = await Promise.all([searchParams, getCategories()]);
  const ajoutee = categories.find((c) => c.id === ajout);

  return (
    <div className="space-y-6 md:space-y-8">
      <EnTete
        surtitre="Catalogue"
        titre="Catégories"
        description="Dans l’ordre de l’accueil et du catalogue : utilisez les flèches pour le changer."
        action={
          <Link href="/admin/categories/nouvelle" className="bouton bouton-nuit w-full sm:w-auto">
            <Plus size={16} aria-hidden /> Nouvelle catégorie
          </Link>
        }
      />

      {ajoutee && (
        <Avis>
          La catégorie « {ajoutee.label} » est créée, à la fin de la liste.{" "}
          <Link href="/admin/articles/nouveau" className="underline">
            Ajouter un article
          </Link>
        </Avis>
      )}
      {suppression && <Avis>La catégorie a été supprimée.</Avis>}

      <ListeCategories categories={categories} />
    </div>
  );
}
