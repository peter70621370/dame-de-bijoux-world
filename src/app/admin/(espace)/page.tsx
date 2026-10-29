import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BadgePercent, ExternalLink, Gem, Sparkles, Tags, type LucideIcon } from "lucide-react";
import { Pastille } from "@/components/admin/ui";
import { verifySession } from "@/lib/dal";
import { getTableauDeBord } from "@/lib/data/admin";
import { formatPrice } from "@/lib/products";

export const metadata: Metadata = {
  title: "Tableau de bord",
};

const jour = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "Africa/Lome" });
const modifie = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "Africa/Lome" });

export default async function TableauDeBordPage() {
  const admin = await verifySession();
  const d = await getTableauDeBord();
  const surDemande = d.categories.filter((c) => c.onRequest).length;
  const maxArticles = Math.max(1, ...d.categories.map((c) => c.articles));

  return (
    <div className="space-y-8 md:space-y-10">
      <header>
        <p className="eyebrow text-or-fonce">{jour.format(new Date())}</p>
        <h1 className="titre mt-3 text-[2.6rem] md:text-5xl">Bonjour, {admin.name.split(" ")[0]}</h1>
        <p className="mt-2 text-douce">Voici l’état de votre boutique en ligne.</p>
      </header>

      <ul className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
        <Stat
          icon={Gem}
          label="Articles en ligne"
          value={d.enLigne}
          hint={d.masques > 0 ? `${d.masques} masqué${d.masques > 1 ? "s" : ""}` : "Tous visibles sur le site"}
        />
        <Stat icon={Sparkles} label="Nouveautés" value={d.nouveautes} hint="Badge « Nouveauté » affiché" />
        <Stat icon={Tags} label="Catégories" value={d.categories.length} hint={`Dont ${surDemande} sur demande`} />
        <Stat icon={BadgePercent} label="Promotions" value={d.promotions} hint="En cours sur le site" />
      </ul>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <section className="rounded-2xl border border-filet bg-white p-5 md:p-7 lg:col-span-2">
          <h2 className="font-serif text-2xl">Articles modifiés récemment</h2>
          {d.recents.length === 0 ? (
            <p className="mt-4 text-sm text-douce">Aucun article pour l’instant.</p>
          ) : (
            <ul className="mt-4 divide-y divide-filet">
              {d.recents.map((p) => (
                <li key={p.id} className="flex items-center gap-4 py-3.5">
                  <Link href={`/admin/articles/${p.id}`} className="flex min-w-0 flex-1 items-center gap-4 rounded-xl">
                    <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-sable">
                      {p.images[0] && (
                        <Image src={p.images[0].url} alt="" fill sizes="56px" className="object-cover" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{p.name}</span>
                      <span className="mt-0.5 block truncate text-sm text-douce">
                        {p.category.label} ·{" "}
                        <span className="prix">{formatPrice(p.enPromo && p.promoPrice ? p.promoPrice : p.price)}</span>
                      </span>
                      <span className="mt-1.5 flex flex-wrap gap-1.5">
                        <Pastille ton={p.published ? "vert" : "gris"}>{p.published ? "En ligne" : "Masqué"}</Pastille>
                        {p.enPromo && <Pastille ton="or">Promo</Pastille>}
                        {p.isNew && <Pastille ton="rubis">Nouveauté</Pastille>}
                      </span>
                    </span>
                  </Link>
                  <div className="flex shrink-0 flex-col items-end gap-1 text-right">
                    <span className="text-xs text-douce">{modifie.format(p.updatedAt)}</span>
                    {p.published && (
                      <a
                        href={`/selection/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Voir « ${p.name} » sur le site`}
                        className="grid size-9 place-items-center rounded-lg text-douce transition-colors hover:bg-sable hover:text-encre"
                      >
                        <ExternalLink size={16} aria-hidden />
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-filet bg-white p-5 md:p-7">
          <h2 className="font-serif text-2xl">Articles par catégorie</h2>
          <ul className="mt-5 space-y-4">
            {d.categories.map((c) => (
              <li key={c.id}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span>{c.label}</span>
                  <span className="prix shrink-0 font-medium">
                    {c.articles === 0 && c.onRequest ? <span className="font-normal text-douce">Sur demande</span> : c.articles}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-sable">
                  <div className="h-full rounded-full bg-or" style={{ width: `${(c.articles / maxArticles) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, hint }: { icon: LucideIcon; label: string; value: number; hint: string }) {
  return (
    <li className="rounded-2xl border border-filet bg-white p-4 md:p-6">
      <span className="grid size-10 place-items-center rounded-xl bg-sable text-or-fonce">
        <Icon size={19} aria-hidden />
      </span>
      <p className="prix mt-4 font-serif text-4xl leading-none md:text-5xl">{value}</p>
      <p className="mt-2 text-sm font-medium">{label}</p>
      <p className="mt-0.5 text-xs leading-snug text-douce">{hint}</p>
    </li>
  );
}

