import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { NouvelleVisite } from "@/components/admin/NouvelleVisite";
import { EnTete } from "@/components/admin/ui";
import { enregistrerPromotion } from "@/lib/actions/promotions";
import { getArticlesPourPromo } from "@/lib/data/admin";
import { FormulairePromotion } from "../FormulairePromotion";

export const metadata: Metadata = {
  title: "Nouvelle promotion",
};

export default async function NouvellePromotionPage({ searchParams }: PageProps<"/admin/promotions/nouvelle">) {
  const [{ article, prix }, articles] = await Promise.all([searchParams, getArticlesPourPromo()]);
  const choisi = articles.find((a) => a.id === article);
  // Un article déjà en promotion se modifie depuis sa propre page.
  if (choisi && choisi.promoPrice !== null) redirect(`/admin/promotions/${choisi.id}`);

  const libres = articles.filter((a) => a.promoPrice === null);
  const prixInitial = typeof prix === "string" && /^\d+$/.test(prix) ? prix : "";

  return (
    <div className="space-y-6 md:space-y-8">
      <EnTete retour={{ href: "/admin/promotions", label: "Promotions" }} surtitre="Catalogue" titre="Nouvelle promotion" />
      {libres.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-filet px-5 py-10 text-center text-sm text-douce">
          {articles.length === 0 ? (
            <>
              Ajoutez d’abord un{" "}
              <Link href="/admin/articles/nouveau" className="underline">
                article
              </Link>
              .
            </>
          ) : (
            "Tous vos articles sont déjà en promotion."
          )}
        </p>
      ) : (
        <NouvelleVisite>
          <FormulairePromotion
            // Relance d'une promotion terminée : le formulaire repart de l'article et du prix indiqués dans l'adresse.
            key={`${choisi?.id}-${prixInitial}`}
            nouvelle
            articles={libres}
            action={enregistrerPromotion}
            aujourdhui={new Date().toISOString().slice(0, 10)}
            promo={{ productId: choisi?.id ?? "", promoPrice: prixInitial, promoEndsAt: "" }}
          />
        </NouvelleVisite>
      )}
    </div>
  );
}
