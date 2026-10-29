import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CarteActualite } from "@/components/CarteActualite";
import { JsonLd } from "@/components/JsonLd";
import { Breadcrumbs } from "@/components/PageHeader";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { ShareButton } from "@/components/ShareButton";
import { IconArrow, IconWhatsApp } from "@/components/icons";
import { getActualitePubliee, getActualitesPubliees } from "@/lib/data/actualites";
import { getBoutique } from "@/lib/data/boutique";
import { getCatalogue } from "@/lib/data/catalogue";
import { formatDate } from "@/lib/dates";
import { site } from "@/lib/site";
import { newsEnquiryUrl } from "@/lib/whatsapp";

export async function generateStaticParams() {
  const actualites = await getActualitesPubliees();
  // Au moins une entrée est exigée ; une adresse inconnue renvoie simplement la page 404.
  return actualites.length ? actualites.map((a) => ({ slug: a.slug })) : [{ slug: "aucune-actualite" }];
}

export async function generateMetadata({ params }: PageProps<"/actualites/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const actualite = await getActualitePubliee(slug);
  if (!actualite) return {};
  return {
    title: actualite.titre,
    description: actualite.resume,
    alternates: { canonical: `/actualites/${actualite.slug}` },
    openGraph: {
      type: "article",
      title: actualite.titre,
      description: actualite.resume,
      publishedTime: actualite.date,
      ...(actualite.image && { images: [{ url: actualite.image }] }),
    },
  };
}

export default function ActualitePage({ params }: PageProps<"/actualites/[slug]">) {
  // Le squelette s'affiche instantanément pendant la navigation client.
  return (
    <Suspense fallback={<ActualiteSkeleton />}>
      <ActualiteContent params={params} />
    </Suspense>
  );
}

function ActualiteSkeleton() {
  return (
    <div className="conteneur grid animate-pulse gap-10 pt-16 pb-20 lg:grid-cols-12 lg:gap-16" aria-hidden>
      <div className="aspect-[4/3] rounded-2xl bg-sable lg:col-span-6 lg:aspect-[4/5]" />
      <div className="space-y-5 lg:col-span-6">
        <div className="h-3 w-28 rounded bg-sable" />
        <div className="h-14 w-4/5 rounded-xl bg-sable" />
        <div className="h-32 w-full rounded-xl bg-sable" />
      </div>
    </div>
  );
}

async function ActualiteContent({ params }: { params: PageProps<"/actualites/[slug]">["params"] }) {
  const { slug } = await params;
  const [actualites, { products }, boutique] = await Promise.all([
    getActualitesPubliees(),
    getCatalogue(),
    getBoutique(),
  ]);
  const actualite = actualites.find((a) => a.slug === slug);
  if (!actualite) notFound();

  // Articles présentés et toujours en ligne, dans l'ordre du catalogue.
  const articles = products.filter((p) => actualite.articles.includes(p.slug));
  const autres = actualites.filter((a) => a.slug !== slug).slice(0, 3);
  // Une ligne vide sépare deux paragraphes ; un simple retour à la ligne est gardé tel quel.
  const paragraphes = actualite.texte
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const adresse = `/actualites/${actualite.slug}`;

  return (
    <>
      <div className="conteneur pt-8">
        <Breadcrumbs items={[{ href: "/actualites", label: "Actualités" }, { label: actualite.titre }]} />
      </div>

      <article className="conteneur grid gap-10 pt-8 pb-20 md:pt-12 md:pb-24 lg:grid-cols-12 lg:gap-16">
        {actualite.image && (
          <div className="lg:col-span-6">
            {/* Plus basse sur téléphone : le titre reste dans le premier écran. */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-sable lg:sticky lg:top-28 lg:aspect-[4/5]">
              <Image
                src={actualite.image}
                alt=""
                fill
                priority
                sizes="(min-width:1024px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        )}

        <div className={actualite.image ? "lg:col-span-6 lg:py-6" : "lg:col-span-8 lg:col-start-3"}>
          <p className="eyebrow animate-monte text-or-fonce">
            <time dateTime={actualite.date}>{formatDate(actualite.date)}</time>
          </p>
          <h1 className="titre mt-5 animate-monte text-[clamp(2.6rem,6vw,4.75rem)] break-words [animation-delay:80ms]">
            {actualite.titre}
          </h1>
          {paragraphes.length > 0 ? (
            <div className="mt-8 animate-monte space-y-5 text-base leading-relaxed text-encre/85 [animation-delay:160ms] md:text-lg">
              {paragraphes.map((p, i) => (
                <p key={i} className="whitespace-pre-line">
                  {p}
                </p>
              ))}
            </div>
          ) : (
            actualite.resume !== actualite.titre && (
              <p className="mt-8 text-base leading-relaxed text-encre/85 md:text-lg">{actualite.resume}</p>
            )
          )}

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {articles.length > 0 && (
              <a href="#articles" className="bouton bouton-nuit">
                Voir les articles <IconArrow width={16} height={16} />
              </a>
            )}
            <a href={newsEnquiryUrl(boutique.whatsapp, actualite)} target="_blank" rel="noopener noreferrer" className="bouton bouton-whatsapp">
              <IconWhatsApp width={18} height={18} /> Écrire sur WhatsApp
            </a>
            <ShareButton title={actualite.titre} path={adresse} className="self-center border border-filet" />
          </div>
        </div>
      </article>

      {articles.length > 0 && (
        <section id="articles" className="scroll-mt-24 border-t border-filet bg-sable/50">
          <div className="conteneur py-20 md:py-24">
            <Reveal>
              <p className="eyebrow text-or-fonce">Dans cette actualité</p>
              <h2 className="titre mt-4 text-[clamp(2.3rem,4.5vw,3.75rem)]">
                {articles.length > 1 ? "Les articles" : "L’article"}
              </h2>
            </Reveal>
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {articles.map((p, i) => (
                <Reveal key={p.slug} delay={(i % 4) * 90}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {autres.length > 0 && (
        <section className="border-t border-filet">
          <div className="conteneur py-20 md:py-24">
            <Reveal className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="eyebrow text-or-fonce">À lire aussi</p>
                <h2 className="titre mt-4 text-[clamp(2.3rem,4.5vw,3.75rem)]">Autres actualités</h2>
              </div>
              <Link href="/actualites" className="lien-souligne">
                Toutes les actualités <IconArrow width={14} height={14} />
              </Link>
            </Reveal>
            <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {autres.map((a, i) => (
                <Reveal as="li" key={a.slug} delay={i * 90}>
                  <CarteActualite actualite={a} niveau="h3" />
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: actualite.titre,
          description: actualite.resume,
          datePublished: actualite.date,
          ...(actualite.image && { image: [new URL(actualite.image, site.url).href] }),
          author: { "@type": "Organization", name: site.name, url: site.url },
          publisher: {
            "@type": "Organization",
            name: site.name,
            logo: { "@type": "ImageObject", url: `${site.url}/marque/icone-512.png` },
          },
          mainEntityOfPage: `${site.url}${adresse}`,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: site.url },
            { "@type": "ListItem", position: 2, name: "Actualités", item: `${site.url}/actualites` },
            { "@type": "ListItem", position: 3, name: actualite.titre },
          ],
        }}
      />
    </>
  );
}
