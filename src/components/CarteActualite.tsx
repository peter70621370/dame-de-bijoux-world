import Image from "next/image";
import Link from "next/link";
import type { Actualite } from "@/lib/data/actualites";
import { formatDate } from "@/lib/dates";
import { IconArrow } from "./icons";
import { LogoEmbleme } from "./LogoEmbleme";

/** Vignette d'une actualité ; `vedette` : la plus récente, en grand en tête de la page Actualités. */
export function CarteActualite({
  actualite,
  niveau: Titre = "h2",
  vedette = false,
}: {
  actualite: Actualite;
  /** Niveau du titre dans la page. */
  niveau?: "h2" | "h3";
  vedette?: boolean;
}) {
  const { slug, titre, resume, image, date } = actualite;
  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-filet bg-white shadow-sm shadow-nuit/5 transition-shadow duration-300 hover:shadow-xl hover:shadow-nuit/10 ${
        vedette ? "md:flex-row" : ""
      }`}
    >
      <div
        className={`relative aspect-[4/3] shrink-0 overflow-hidden bg-nuit ${
          vedette ? "md:aspect-auto md:min-h-96 md:w-1/2" : ""
        }`}
      >
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            sizes={vedette ? "(min-width:768px) 50vw, 100vw" : "(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="grain halo absolute inset-0 grid place-items-center">
            <LogoEmbleme className="size-24" />
          </div>
        )}
      </div>
      <div className={`flex flex-1 flex-col p-6 ${vedette ? "md:justify-center md:p-10 lg:p-14" : ""}`}>
        <p className="eyebrow text-[0.65rem] text-or-fonce">
          <time dateTime={date}>{formatDate(date)}</time>
        </p>
        <Titre className={`mt-3 font-serif leading-tight ${vedette ? "text-3xl md:text-[2.6rem]" : "text-2xl"}`}>
          {/* Toute la vignette mène à l'actualité. */}
          <Link href={`/actualites/${slug}`} className="after:absolute after:inset-0">
            {titre}
          </Link>
        </Titre>
        {resume !== titre && (
          <p className={`mt-3 leading-relaxed text-douce ${vedette ? "line-clamp-4 md:text-lg" : "line-clamp-3 text-sm"}`}>
            {resume}
          </p>
        )}
        <span className="mt-auto inline-flex items-center gap-2 pt-6 text-[0.65rem] font-medium uppercase tracking-[0.2em]">
          Lire la suite{" "}
          <IconArrow width={14} height={14} className="transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </article>
  );
}
