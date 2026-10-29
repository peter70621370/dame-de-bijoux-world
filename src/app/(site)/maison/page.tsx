import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { IconArrow } from "@/components/icons";

export const metadata: Metadata = {
  title: "La Maison — notre histoire",
  description:
    "Dame de Bijoux World est née d’une conviction : porter un bijou doit rester un plaisir accessible. Découvrez notre histoire et nos engagements.",
  alternates: { canonical: "/maison" },
};

const valeurs = [
  { title: "Éclat", text: "Des pièces choisies pour leur brillance et leur finition soignée." },
  { title: "Accessibilité", text: "Le luxe d’un bel accessoire, à des prix qui restent doux." },
  { title: "Proximité", text: "Une équipe disponible pour vous conseiller, simplement." },
];

export default function MaisonPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "La Maison" }]}
        eyebrow="La Maison"
        title={
          <>
            L’art de se parer, <em>pour toutes.</em>
          </>
        }
      />

      <section className="conteneur grid gap-12 py-20 md:py-28 lg:grid-cols-12 lg:items-center">
        <Reveal className="relative aspect-square overflow-hidden rounded-2xl bg-nuit lg:col-span-5">
          <Image
            src="/marque/logo-dame-de-bijoux.svg"
            alt="Logo Dame de Bijoux World : monogramme DB couronné, cœur rubis"
            fill
            sizes="(min-width:1024px) 40vw, 100vw"
            className="object-contain p-8 md:p-12"
          />
        </Reveal>
        <Reveal delay={120} className="space-y-6 text-lg leading-relaxed text-douce lg:col-span-6 lg:col-start-7">
          <p className="eyebrow text-or-fonce">Notre histoire</p>
          <p className="font-serif text-3xl leading-snug text-encre md:text-4xl">
            Dame de Bijoux World est née d’une conviction : porter un bijou doit rester un plaisir accessible.
          </p>
          <p>
            Spécialistes de la vente de bijoux et d’accessoires de beauté, nous sélectionnons chaque pièce avec
            soin pour vous offrir éclat et élégance.
          </p>
          <p>
            Grossistes comme particuliers, nos clientes trouvent chez nous un choix renouvelé, des tarifs justes et
            un accompagnement personnalisé. Notre signature le dit simplement :{" "}
            <em className="font-serif text-2xl text-encre not-italic">gros… petit prix.</em>
          </p>
        </Reveal>
      </section>

      <section className="grain relative overflow-hidden bg-nuit text-ivoire">
        <div className="halo absolute inset-0" aria-hidden />
        <ol className="conteneur relative grid gap-12 py-20 md:grid-cols-3 md:py-28">
          {valeurs.map((v, i) => (
            <Reveal as="li" key={v.title} delay={i * 120} className="border-t border-ivoire/20 pt-8">
              <span className="prix font-serif text-5xl text-or">0{i + 1}</span>
              <p className="titre mt-6 text-4xl">{v.title}</p>
              <p className="mt-3 leading-relaxed text-ivoire/70">{v.text}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="conteneur flex flex-col items-center py-20 text-center md:py-28">
        <Reveal>
          <p className="titre text-[clamp(2.4rem,5vw,4rem)]">Envie d’en voir plus ?</p>
          <Link href="/selection" className="bouton bouton-nuit mt-10">
            Voir la sélection <IconArrow width={16} height={16} />
          </Link>
        </Reveal>
      </section>
    </>
  );
}
