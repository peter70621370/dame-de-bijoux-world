import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CircleStop, ExternalLink } from "lucide-react";
import { BoutonAction } from "@/components/admin/BoutonAction";
import { NouvelleVisite } from "@/components/admin/NouvelleVisite";
import { EnTete } from "@/components/admin/ui";
import { arreterPromotion, enregistrerPromotion } from "@/lib/actions/promotions";
import { getChoixArticles } from "@/lib/data/admin";
import { FormulairePromotion } from "../FormulairePromotion";

export const metadata: Metadata = {
  title: "Modifier une promotion",
};

export default async function PromotionPage({ params }: PageProps<"/admin/promotions/[id]">) {
  const [{ id }, articles] = await Promise.all([params, getChoixArticles()]);
  const article = articles.find((a) => a.id === id);
  if (!article) notFound();
  // Promotion terminée entre-temps : on propose de la relancer.
  if (article.promoPrice === null) redirect(`/admin/promotions/nouvelle?article=${id}`);

  return (
    <div className="space-y-6 md:space-y-8">
      <EnTete
        centre
        retour={{ href: "/admin/promotions", label: "Promotions" }}
        surtitre="Promotion en cours"
        titre={article.name}
        action={
          article.visible && (
            <a
              href={`/selection/${article.slug}`}
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
        <FormulairePromotion
          nouvelle={false}
          articles={[article]}
          action={enregistrerPromotion}
          aujourdhui={new Date().toISOString().slice(0, 10)}
          promo={{ productId: article.id, promoPrice: String(article.promoPrice), promoEndsAt: article.promoEndsAt }}
        />
      </NouvelleVisite>

      <section className="mx-auto max-w-3xl border-t border-filet pt-6">
        <BoutonAction
          action={arreterPromotion.bind(null, article.id)}
          enCours="Arrêt en cours…"
          className="inline-flex h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-rubis transition-colors hover:bg-rubis/8 disabled:opacity-60"
        >
          <CircleStop size={16} aria-hidden /> Arrêter la promotion maintenant
        </BoutonAction>
        <p className="mt-1 px-3 text-[0.8rem] text-douce">L’article reprend son prix habituel sur le site.</p>
      </section>
    </div>
  );
}
