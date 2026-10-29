import Image from "next/image";
import Link from "next/link";
import { formatPrice, getCategory, type Product } from "@/lib/products";
import { productEnquiryUrl } from "@/lib/whatsapp";
import { ShareButton } from "./ShareButton";
import { IconSparkle, IconWhatsApp } from "./icons";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const [first, second] = product.images;
  const href = `/selection/${product.slug}`;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-filet bg-white shadow-sm shadow-nuit/5 transition-shadow duration-300 hover:shadow-xl hover:shadow-nuit/10">
      <div className="relative aspect-[4/3] overflow-hidden bg-sable">
        <Link href={href} tabIndex={-1} aria-hidden className="absolute inset-0">
          <Image
            src={first.src}
            alt={first.alt}
            fill
            priority={priority}
            sizes="(min-width:1280px) 25vw, (min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
            className={`object-cover transition-[transform,opacity] duration-700 ease-out group-hover:scale-[1.04] ${
              second ? "group-hover:opacity-0" : ""
            }`}
          />
          {second && (
            <Image
              src={second.src}
              alt=""
              fill
              sizes="(min-width:1280px) 25vw, (min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
              className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            />
          )}
        </Link>
        <span className="pointer-events-none absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-encre shadow-sm">
          {getCategory(product.category).tag}
        </span>
        {product.isNew && (
          <span className="pointer-events-none absolute top-3 right-3 rounded-full bg-rubis px-3 py-1 text-xs font-semibold text-white shadow-sm">
            Nouveauté
          </span>
        )}
        <ShareButton title={product.name} path={href} className="absolute right-3 bottom-3" />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-[1.05rem] font-semibold leading-snug">
          <Link href={href} className="hover:text-or-fonce">
            {product.name}
          </Link>
        </h3>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-douce">
          <IconSparkle width={15} height={15} className="shrink-0 text-or" />
          {product.option
            ? `${product.option.values.length} ${product.option.plural} au choix`
            : "Modèle unique"}
        </p>

        <p className="mt-auto pt-5">
          <span className="prix text-xl font-semibold text-or-fonce">{formatPrice(product.price)}</span>
          <span className="text-sm text-douce"> / pièce</span>
        </p>
        <div className="mt-4 flex gap-2.5">
          <Link
            href={href}
            className="flex h-11 flex-1 items-center justify-center rounded-xl border border-encre/20 text-sm font-medium transition-colors hover:border-encre hover:bg-encre hover:text-ivoire"
          >
            Voir les détails
          </Link>
          <a
            href={productEnquiryUrl(product)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Commander ${product.name} sur WhatsApp`}
            className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#1f8f4e] text-white transition-colors hover:bg-[#187a42]"
          >
            <IconWhatsApp width={20} height={20} />
          </a>
        </div>
      </div>
    </article>
  );
}
