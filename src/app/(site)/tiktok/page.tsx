import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { IconArrow, IconTikTok } from "@/components/icons";
import { getBoutique } from "@/lib/data/boutique";

export async function generateMetadata(): Promise<Metadata> {
  const { compteTikTok } = await getBoutique();
  return {
    title: `TikTok ${compteTikTok} — arrivages et inspirations`,
    description: `Suivez ${compteTikTok} sur TikTok : arrivages, idées d’assortiments et coulisses de Dame de Bijoux World.`,
    alternates: { canonical: "/tiktok" },
  };
}

const piliers = [
  { title: "Arrivages", text: "Découvrez les nouvelles pièces dès leur arrivée, avant tout le monde." },
  { title: "Inspirations", text: "Idées d’assortiments et de looks avec nos bijoux." },
  { title: "Coulisses", text: "Un aperçu de notre univers au quotidien." },
];

const photos = [
  "/produits/bracelet-trefle-coloris.jpg",
  "/produits/ceinture-papillons-argent.jpg",
  "/produits/chaine-coquillages-etoiles.jpg",
];

export default async function TikTokPage() {
  const boutique = await getBoutique();
  return (
    <>
      <PageHeader
        crumbs={[{ label: "TikTok" }]}
        eyebrow={boutique.compteTikTok}
        title="Rejoignez la communauté."
        intro="Nos arrivages passent d’abord en vidéo. Abonnez-vous pour ne rien manquer, puis commandez vos coups de cœur ici ou sur WhatsApp."
      >
        <a
          href={boutique.lienTikTok}
          target="_blank"
          rel="noopener noreferrer"
          className="bouton bouton-nuit mt-10 animate-monte [animation-delay:240ms]"
        >
          <IconTikTok width={18} height={18} /> Ouvrir TikTok <IconArrow width={16} height={16} />
        </a>
      </PageHeader>

      <section className="conteneur grid gap-12 py-20 md:py-28 lg:grid-cols-12 lg:items-center">
        <div className="grid grid-cols-3 gap-3 lg:col-span-6">
          {photos.map((src, i) => (
            <Reveal key={src} delay={i * 100} className={`relative aspect-[9/16] overflow-hidden rounded-2xl bg-sable ${i === 1 ? "translate-y-8" : ""}`}>
              <Image src={src} alt="" fill sizes="(min-width:1024px) 16vw, 33vw" className="object-cover" />
            </Reveal>
          ))}
        </div>
        <ol className="space-y-10 lg:col-span-5 lg:col-start-8">
          {piliers.map((p, i) => (
            <Reveal as="li" key={p.title} delay={i * 100} className="flex gap-6 border-t border-filet pt-6">
              <span className="prix font-serif text-4xl text-or">0{i + 1}</span>
              <span>
                <span className="block font-serif text-3xl">{p.title}</span>
                <span className="mt-2 block leading-relaxed text-douce">{p.text}</span>
              </span>
            </Reveal>
          ))}
        </ol>
      </section>
    </>
  );
}
