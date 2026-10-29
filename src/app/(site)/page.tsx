import Image from "next/image";
import Link from "next/link";
import { ContactCards } from "@/components/ContactCards";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { FaqList } from "@/components/Faq";
import {
  IconArrow,
  IconBag,
  IconChat,
  IconCrown,
  IconPhone,
  IconSparkle,
  IconStore,
  IconTag,
  IconTikTok,
  IconWhatsApp,
} from "@/components/icons";
import { getCatalogue } from "@/lib/data/catalogue";
import { formatPrice, minPrice, type Category, type Product } from "@/lib/products";
import { faq } from "@/lib/faq";
import { site } from "@/lib/site";
import { greetingUrl } from "@/lib/whatsapp";

/** Article mis en avant sur la photo d'accueil (la photo elle-même reste fixe pour l'instant). */
const SLUG_VEDETTE = "chaine-de-taille-coquillages-etoiles";

export default async function Home() {
  const { categories, products } = await getCatalogue();
  return (
    <>
      <Hero vedette={products.find((p) => p.slug === SLUG_VEDETTE)} />
      <Assurances prixMin={minPrice(products)} />
      <Categories categories={categories} />
      {products.length > 0 && <Selection products={products} />}
      <CommentCommander />
      <Gros />
      <Maison />
      <TikTok />
      <Questions />
      <Visite />
    </>
  );
}

function Hero({ vedette }: { vedette?: Product }) {
  return (
    <section className="grain relative isolate overflow-hidden bg-nuit text-ivoire">
      <div className="halo absolute inset-0 -z-10" aria-hidden />
      <div className="conteneur grid items-center gap-14 pt-10 pb-20 md:pt-20 lg:min-h-[min(calc(100svh-5rem),820px)] lg:grid-cols-12 lg:gap-10 lg:py-16">
        <div className="lg:col-span-6 xl:col-span-6">
          <p className="eyebrow flex animate-monte items-center gap-3 text-or-clair">
            <IconCrown width={16} height={16} /> {site.signature} · {site.city}
          </p>
          <h1 className="titre mt-7 animate-monte text-[clamp(3.1rem,8.2vw,6.8rem)] [animation-delay:90ms]">
            L’éclat des <em>belles</em> choses, à&nbsp;petit prix.
          </h1>
          <p className="mt-7 max-w-lg animate-monte text-base leading-relaxed text-ivoire/75 [animation-delay:180ms] md:text-lg">
            Bracelets, chaînes de taille, bagues et accessoires de beauté sélectionnés avec exigence.
            En gros comme au détail, commandés en un clic sur WhatsApp.
          </p>
          <div className="mt-10 flex animate-monte flex-col gap-3 [animation-delay:270ms] sm:flex-row sm:flex-wrap">
            <Link href="/selection" className="bouton bouton-or">
              Découvrir la sélection <IconArrow width={16} height={16} />
            </Link>
            <a href={greetingUrl} target="_blank" rel="noopener noreferrer" className="bouton bouton-contour-clair">
              <IconWhatsApp width={18} height={18} /> Écrire sur WhatsApp
            </a>
          </div>
        </div>

        {/* Sur mobile, les photos passent au-dessus du titre ; le titre reste premier dans le HTML. */}
        <div className="relative order-first lg:order-none lg:col-span-6 lg:pl-6 xl:pl-12">
          <div className="relative mx-auto aspect-[4/5] w-[78%] max-w-[460px] animate-[fondu_1.4s_ease-out_both] overflow-hidden rounded-2xl lg:mr-0">
            <Image
              src="/produits/chaine-coquillages-etoiles.jpg"
              alt="Chaîne de taille dorée Coquillages & Étoiles portée sur une jupe en satin"
              fill
              priority
              sizes="(min-width:1024px) 40vw, 78vw"
              className="object-cover"
            />
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-or-clair/25" />
          </div>
          <div className="absolute bottom-[-6%] left-0 aspect-square w-[42%] max-w-[240px] animate-monte overflow-hidden rounded-2xl border-[6px] border-nuit shadow-2xl [animation-delay:450ms] lg:left-6">
            <Image
              src="/produits/bracelet-jonc-vis-clou.jpg"
              alt="Joncs dorés vis et clou"
              fill
              sizes="(min-width:1024px) 16vw, 40vw"
              className="object-cover"
            />
          </div>
          {vedette && (
            <Link
              href={`/selection/${vedette.slug}`}
              className="absolute top-[8%] right-0 flex animate-monte items-center gap-3 rounded-2xl bg-ivoire py-3 pr-4 pl-3 text-encre shadow-2xl [animation-delay:600ms] hover:bg-sable lg:-right-4"
            >
              <span className="grid size-9 place-items-center rounded-full bg-nuit text-or-clair">
                <IconSparkle width={16} height={16} />
              </span>
              <span className="leading-tight">
                {vedette.isNew && (
                  <span className="block text-[0.65rem] uppercase tracking-[0.18em] text-rubis">Nouveauté</span>
                )}
                <span className="block font-serif text-lg">Coquillages & Étoiles</span>
                <span className="prix block text-xs text-douce">{formatPrice(vedette.price)}</span>
              </span>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function Assurances({ prixMin }: { prixMin: number | null }) {
  const items = [
    {
      icon: IconTag,
      title: "Petits prix",
      text: prixMin !== null ? `Des bijoux dès ${formatPrice(prixMin)}.` : "Des bijoux pour tous les budgets.",
    },
    { icon: IconBag, title: "Gros & détail", text: "À l’unité ou en quantité, au juste prix." },
    { icon: IconChat, title: "Commande WhatsApp", text: "Votre liste envoyée en un clic." },
    { icon: IconStore, title: "Retrait ou livraison", text: "En boutique à Adewui ou chez vous." },
  ];
  return (
    <section aria-label="Nos engagements" className="border-b border-filet bg-ivoire">
      <ul className="conteneur grid grid-cols-2 gap-y-8 py-10 md:py-12 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text }, i) => (
          <Reveal as="li" key={title} delay={i * 80} className="flex gap-4 pr-4">
            <Icon width={24} height={24} className="mt-0.5 shrink-0 text-or-fonce" />
            <div>
              <p className="font-serif text-xl leading-tight">{title}</p>
              <p className="mt-1 text-sm leading-snug text-douce">{text}</p>
            </div>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

function SectionTitle({
  eyebrow,
  title,
  link,
}: {
  eyebrow: string;
  title: string;
  link?: { href: string; label: string };
}) {
  return (
    <Reveal className="flex flex-wrap items-end justify-between gap-6">
      <div>
        <p className="eyebrow text-or-fonce">{eyebrow}</p>
        <h2 className="titre mt-4 text-[clamp(2.5rem,5.5vw,4.5rem)]">{title}</h2>
      </div>
      {link && (
        <Link href={link.href} className="lien-souligne">
          {link.label} <IconArrow width={14} height={14} />
        </Link>
      )}
    </Reveal>
  );
}

function Categories({ categories }: { categories: Category[] }) {
  return (
    <section className="conteneur py-20 md:py-28">
      <SectionTitle eyebrow="Univers" title="Trouvez votre pièce" />
      <ul className="mt-12 grid grid-cols-2 gap-3 md:mt-14 md:gap-5 lg:grid-cols-3">
        {categories.map((c, i) => {
          const img = c.image;
          return (
            <Reveal as="li" key={c.id} delay={(i % 3) * 90}>
              <Link
                href={`/selection?categorie=${c.id}`}
                className={`group relative isolate flex flex-col justify-end overflow-hidden rounded-2xl p-5 md:aspect-[5/4] md:p-8 ${
                  img ? "aspect-[4/5] text-ivoire" : "min-h-44 bg-sable text-encre"
                }`}
              >
                {img ? (
                  <>
                    <Image
                      src={img}
                      alt=""
                      fill
                      sizes="(min-width:1024px) 33vw, 50vw"
                      className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-luxe)] group-hover:scale-105"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-nuit/90 via-nuit/45 to-nuit/5" />
                  </>
                ) : (
                  <span
                    aria-hidden
                    className="absolute -top-6 -right-4 font-serif text-[9rem] leading-none text-or/15 transition-transform duration-700 group-hover:-translate-y-2 md:text-[12rem]"
                  >
                    {c.label.charAt(0)}
                  </span>
                )}
                <span className="relative">
                  <span className={`eyebrow text-[0.65rem] ${img ? "text-or-clair" : "text-or-fonce"}`}>
                    {c.onRequest ? "Sur demande" : "En ligne"}
                  </span>
                  <span className="mt-2 block font-serif text-2xl leading-tight md:text-[2rem]">{c.label}</span>
                  <span className="mt-3 hidden max-w-xs text-sm leading-snug opacity-80 md:block">{c.blurb}</span>
                  <span className="mt-4 inline-flex items-center gap-2 text-[0.65rem] font-medium uppercase tracking-[0.2em]">
                    Voir <IconArrow width={14} height={14} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </span>
              </Link>
            </Reveal>
          );
        })}
      </ul>
    </section>
  );
}

function Selection({ products }: { products: Product[] }) {
  // Quatre pièces, nouveautés d'abord : une rangée sur ordinateur, quelle que soit la taille du catalogue.
  const vitrine = [...products].sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew)).slice(0, 4);
  return (
    <section className="border-t border-filet bg-sable/50">
      <div className="conteneur py-20 md:py-28">
        <SectionTitle
          eyebrow="Articles phares"
          title="La sélection du moment"
          link={{ href: "/selection", label: "Tout voir" }}
        />
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:mt-14 lg:grid-cols-4">
          {vitrine.map((p, i) => (
            <Reveal key={p.slug} delay={i * 90}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CommentCommander() {
  const steps = [
    {
      title: "Choisissez",
      text: "Parcourez la sélection, choisissez le coloris ou le modèle et ajoutez vos pièces à votre commande.",
    },
    {
      title: "Envoyez sur WhatsApp",
      text: "Indiquez votre nom et votre quartier : la commande s’ouvre toute rédigée dans WhatsApp.",
    },
    {
      title: "Recevez vos bijoux",
      text: "Nous confirmons la disponibilité, puis vous récupérez en boutique ou vous êtes livrée.",
    },
  ];
  return (
    <section className="conteneur py-20 md:py-28">
      <div className="grid gap-12 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <p className="eyebrow text-or-fonce">Simple comme un message</p>
          <h2 className="titre mt-4 text-[clamp(2.5rem,5vw,4rem)]">Commander en trois gestes</h2>
          <p className="mt-6 max-w-sm leading-relaxed text-douce">
            Pas de compte à créer, pas de paiement en ligne : vous échangez directement avec notre équipe.
          </p>
        </Reveal>
        <ol className="grid gap-10 md:grid-cols-3 lg:col-span-8 lg:gap-8">
          {steps.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 120} className="border-t border-encre pt-6">
              <span className="prix font-serif text-5xl text-or">0{i + 1}</span>
              <p className="mt-5 font-serif text-2xl">{s.title}</p>
              <p className="mt-3 text-sm leading-relaxed text-douce">{s.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Gros() {
  const points = [
    "Tarifs dégressifs selon les quantités",
    "Arrivages réguliers, présentés en avant-première sur TikTok",
    "Conseil pour composer votre assortiment",
    "Réponse directe sur WhatsApp",
  ];
  return (
    <section className="grain relative isolate overflow-hidden bg-nuit text-ivoire">
      <div className="halo absolute inset-0 -z-10 opacity-80" aria-hidden />
      <div className="conteneur grid gap-12 py-20 md:py-28 lg:grid-cols-12 lg:items-center">
        <Reveal className="lg:col-span-7">
          <p className="eyebrow text-or-clair">Revendeuses, boutiques, événements</p>
          <h2 className="titre mt-5 text-[clamp(2.6rem,6vw,5rem)]">
            Achetez en gros, <em>au petit prix.</em>
          </h2>
          <p className="mt-6 max-w-xl leading-relaxed text-ivoire/75">
            Vous revendez des bijoux, préparez un mariage ou des cadeaux pour votre équipe ? Dame de Bijoux World
            est d’abord un grossiste : demandez nos tarifs de gros, nous vous répondons rapidement.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/grossistes" className="bouton bouton-or">
              Demander les tarifs de gros <IconArrow width={16} height={16} />
            </Link>
            <a href={site.phoneHref} className="bouton bouton-contour-clair">
              <IconPhone width={16} height={16} /> {site.phone}
            </a>
          </div>
        </Reveal>
        <Reveal as="ul" delay={150} className="space-y-0 divide-y divide-ivoire/10 border-y border-ivoire/10 lg:col-span-5">
          {points.map((p) => (
            <li key={p} className="flex items-center gap-4 py-5">
              <IconSparkle width={18} height={18} className="shrink-0 text-or" />
              <span className="font-serif text-xl">{p}</span>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

function Maison() {
  return (
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
      <Reveal delay={120} className="lg:col-span-6 lg:col-start-7">
        <p className="eyebrow text-or-fonce">La Maison</p>
        <h2 className="titre mt-4 text-[clamp(2.5rem,5vw,4.25rem)]">Une signature, une promesse</h2>
        <p className="mt-6 max-w-lg leading-relaxed text-douce">
          Dame de Bijoux World célèbre l’art de se parer. Chaque pièce est choisie pour sa brillance, sa tenue
          et sa capacité à sublimer celle qui la porte. Notre signature le dit simplement :{" "}
          <em className="font-serif text-xl text-encre not-italic">gros… petit prix.</em>
        </p>
        <Link href="/maison" className="lien-souligne mt-10">
          Découvrir la Maison <IconArrow width={14} height={14} />
        </Link>
      </Reveal>
    </section>
  );
}

function TikTok() {
  return (
    <section className="border-y border-filet bg-sable/50">
      <div className="conteneur flex flex-col items-start justify-between gap-8 py-14 md:flex-row md:items-center md:py-16">
        <Reveal className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-6">
          <span className="grid size-16 shrink-0 place-items-center rounded-full bg-nuit text-ivoire">
            <IconTikTok width={28} height={28} />
          </span>
          <div>
            <p className="eyebrow text-or-fonce">Arrivages en vidéo</p>
            <p className="titre mt-2 text-3xl md:text-4xl">
              Suivez {site.tiktokHandle} pour voir les nouveautés en premier.
            </p>
          </div>
        </Reveal>
        <a
          href={site.tiktokUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bouton bouton-nuit shrink-0"
        >
          Suivre sur TikTok <IconArrow width={16} height={16} />
        </a>
      </div>
    </section>
  );
}

function Questions() {
  const items = [faq[0].items[0], faq[1].items[0], faq[1].items[1]];
  return (
    <section className="conteneur grid gap-12 py-20 md:py-28 lg:grid-cols-12">
      <Reveal className="lg:col-span-4">
        <p className="eyebrow text-or-fonce">Aide</p>
        <h2 className="titre mt-4 text-[clamp(2.5rem,5vw,4rem)]">Vos questions</h2>
        <Link href="/faq" className="lien-souligne mt-8">
          Toutes les questions <IconArrow width={14} height={14} />
        </Link>
      </Reveal>
      <Reveal delay={120} className="lg:col-span-8">
        <FaqList items={items} />
      </Reveal>
    </section>
  );
}

function Visite() {
  return (
    <section className="conteneur pb-20 md:pb-28">
      <ContactCards />
    </section>
  );
}
