import type { Metadata } from "next";
import { CarteActualite } from "@/components/CarteActualite";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { IconArrow, IconTikTok } from "@/components/icons";
import { getActualitesPubliees } from "@/lib/data/actualites";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Actualités — arrivages et nouveautés",
  description:
    "Arrivages, nouveautés et rendez-vous de Dame de Bijoux World à Lomé : découvrez les dernières pièces et commandez-les sur WhatsApp.",
  alternates: { canonical: "/actualites" },
};

export default async function ActualitesPage() {
  const actualites = await getActualitesPubliees();

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Actualités" }]}
        eyebrow="Actualités"
        title="Arrivages & nouvelles"
        intro="Les dernières pièces arrivées en boutique, nos promotions et les rendez-vous à ne pas manquer."
      />

      <section className="conteneur py-14 md:py-20">
        {actualites.length === 0 ? (
          <div className="mx-auto max-w-lg py-10 text-center">
            <p className="titre text-4xl">Aucune actualité pour le moment</p>
            <p className="mt-4 leading-relaxed text-douce">
              Nos arrivages passent d’abord en vidéo sur TikTok : abonnez-vous pour les voir en premier.
            </p>
            <a
              href={site.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bouton bouton-nuit mt-8"
            >
              <IconTikTok width={18} height={18} /> Suivre {site.tiktokHandle} <IconArrow width={16} height={16} />
            </a>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {actualites.map((a, i) => (
              <Reveal
                as="li"
                key={a.slug}
                delay={i === 0 ? 0 : ((i - 1) % 3) * 90}
                className={i === 0 ? "sm:col-span-2 lg:col-span-3" : ""}
              >
                <CarteActualite actualite={a} vedette={i === 0} />
              </Reveal>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
