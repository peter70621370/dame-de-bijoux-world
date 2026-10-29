import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ImageOff, Plus, RotateCcw } from "lucide-react";
import { BoutonAction } from "@/components/admin/BoutonAction";
import { Avis, EnTete, Pastille } from "@/components/admin/ui";
import { viderPromotionsTerminees } from "@/lib/actions/promotions";
import { getPromotions } from "@/lib/data/admin";
import { discountPercent, formatPrice, formatPromoEnd } from "@/lib/products";

export const metadata: Metadata = {
  title: "Promotions",
};

type Promo = Awaited<ReturnType<typeof getPromotions>>["enCours"][number];

export default async function PromotionsPage({ searchParams }: PageProps<"/admin/promotions">) {
  const [{ promo, arret }, { enCours, terminees }] = await Promise.all([searchParams, getPromotions()]);
  const lancee = enCours.find((p) => p.id === promo);
  const arretee = terminees.find((p) => p.id === arret);

  return (
    <div className="space-y-6 md:space-y-8">
      <EnTete
        surtitre="Catalogue"
        titre="Promotions"
        description="Sur le site, le prix promo remplace le prix, l’ancien est barré et la photo porte un badge « Promo »."
        action={
          <Link href="/admin/promotions/nouvelle" className="bouton bouton-nuit w-full sm:w-auto">
            <Plus size={16} aria-hidden /> Nouvelle promotion
          </Link>
        }
      />

      {lancee && (
        <Avis>
          « {lancee.name} » est à <span className="prix">{formatPrice(lancee.promoPrice)}</span> au lieu de{" "}
          <span className="prix">{formatPrice(lancee.price)}</span>
          {lancee.visible ? " sur le site." : ", mais l’article est masqué du site."}
        </Avis>
      )}
      {arretee && (
        <Avis>La promotion sur « {arretee.name} » est arrêtée. Vous pouvez la relancer depuis « Terminées ».</Avis>
      )}

      <section className="space-y-3">
        <h2 className="font-serif text-2xl">
          En cours <span className="prix text-lg text-douce">{enCours.length}</span>
        </h2>
        {enCours.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-filet px-5 py-10 text-center text-sm text-douce">
            Aucune promotion en cours.
          </p>
        ) : (
          <ul className="divide-y divide-filet overflow-hidden rounded-2xl border border-filet bg-white">
            {enCours.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/admin/promotions/${p.id}`}
                  className="flex items-center gap-3 px-3 py-3 transition-colors hover:bg-sable/40 md:gap-4 md:px-5"
                >
                  <Ligne promo={p}>
                    <Pastille ton="or">−{discountPercent(p.promoPrice, p.price)} %</Pastille>
                    <Pastille ton="gris">
                      {p.promoEndsAt ? `Jusqu’au ${formatPromoEnd(p.promoEndsAt.toISOString())}` : "Sans date de fin"}
                    </Pastille>
                    {!p.visible && <Pastille ton="rubis">Article masqué</Pastille>}
                  </Ligne>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {terminees.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-serif text-2xl">
              Terminées <span className="prix text-lg text-douce">{terminees.length}</span>
            </h2>
            <BoutonAction
              action={viderPromotionsTerminees}
              enCours="Effacement…"
              className="h-10 rounded-xl px-3 text-sm text-douce underline underline-offset-4 transition-colors hover:text-encre disabled:opacity-60"
            >
              Vider la liste
            </BoutonAction>
          </div>
          <ul className="divide-y divide-filet overflow-hidden rounded-2xl border border-filet bg-white">
            {terminees.map((p) => (
              <li key={p.id} className="flex items-center gap-2 py-3 pr-2 pl-3 md:gap-4 md:px-5">
                <div className="flex min-w-0 flex-1 items-center gap-3 opacity-70 md:gap-4">
                  <Ligne promo={p}>
                    <Pastille ton="gris">
                      {p.terminee && p.promoEndsAt
                        ? `Terminée le ${formatPromoEnd(p.promoEndsAt.toISOString())}`
                        : "Sans effet : prix promo plus élevé que le prix"}
                    </Pastille>
                  </Ligne>
                </div>
                <Link
                  href={`/admin/promotions/nouvelle?article=${p.id}&prix=${p.promoPrice}`}
                  className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-or-fonce transition-colors hover:bg-sable"
                >
                  <RotateCcw size={15} aria-hidden /> Relancer
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Ligne({ promo: p, children }: { promo: Promo; children: ReactNode }) {
  return (
    <>
      <span className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-sable text-douce">
        {p.photo ? (
          <Image src={p.photo} alt="" fill sizes="64px" className="object-cover" />
        ) : (
          <ImageOff size={20} aria-hidden />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{p.name}</span>
        <span className="mt-0.5 block truncate text-sm text-douce">
          <span className="prix text-rubis">{formatPrice(p.promoPrice)}</span> <s className="prix">{formatPrice(p.price)}</s>
          {" · "}
          {p.categoryLabel}
        </span>
        <span className="mt-1.5 flex flex-wrap gap-1.5">{children}</span>
      </span>
    </>
  );
}
