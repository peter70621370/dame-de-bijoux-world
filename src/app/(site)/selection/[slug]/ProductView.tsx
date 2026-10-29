"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { Quantity } from "@/components/cart/CartDrawer";
import { IconBag, IconChat, IconCheck, IconPlus, IconStore, IconTag, IconWhatsApp } from "@/components/icons";
import { formatPrice, type Product } from "@/lib/products";
import { site } from "@/lib/site";
import { orderMessage, whatsappUrl } from "@/lib/whatsapp";

export function ProductView({ product }: { product: Product }) {
  const cart = useCart();
  const [variant, setVariant] = useState(product.option?.values[0].label);
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  function chooseVariant(label: string, image?: number) {
    setVariant(label);
    if (image !== undefined) setImageIndex(image);
  }

  function addToCart() {
    cart.add(product, variant, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const directOrder = whatsappUrl(
    orderMessage([
      {
        slug: product.slug,
        name: product.name,
        variant,
        optionName: product.option?.name,
        quantity,
        price: product.price,
      },
    ]),
  );

  const image = product.images[imageIndex] ?? product.images[0];

  return (
    <section className="conteneur grid gap-10 pt-8 pb-20 md:pb-28 lg:grid-cols-12 lg:gap-16">
      {/* Galerie */}
      <div className="lg:col-span-7">
        <div className="flex flex-col-reverse gap-3 md:flex-row">
          {product.images.length > 1 && (
            <div className="flex gap-3 md:flex-col" role="group" aria-label="Photos du produit">
              {product.images.map((img, i) => (
                <button
                  key={img.src}
                  type="button"
                  onClick={() => setImageIndex(i)}
                  aria-label={`Photo ${i + 1} sur ${product.images.length}`}
                  aria-pressed={i === imageIndex}
                  className={`relative aspect-[4/5] w-20 overflow-hidden rounded-xl bg-sable transition-opacity md:w-24 ${
                    i === imageIndex ? "ring-1 ring-encre ring-offset-2 ring-offset-ivoire" : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image src={img.src} alt="" fill sizes="96px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
          <div className="relative aspect-[4/5] flex-1 overflow-hidden rounded-2xl bg-sable">
            {product.images.map((img, i) => (
              <Image
                key={img.src}
                src={img.src}
                alt={img.alt}
                fill
                priority={i === 0}
                sizes="(min-width:1024px) 52vw, 100vw"
                className={`object-cover transition-opacity duration-700 ${i === imageIndex ? "opacity-100" : "opacity-0"}`}
              />
            ))}
            {product.isNew && (
              <span className="eyebrow absolute top-4 left-4 rounded-full bg-ivoire px-3 py-2 text-[0.62rem] text-rubis">
                Nouveauté
              </span>
            )}
            <span className="sr-only" aria-live="polite">
              {image.alt}
            </span>
          </div>
        </div>
      </div>

      {/* Infos et achat */}
      <div className="lg:col-span-5">
        <div className="lg:sticky lg:top-28">
          <p className="eyebrow text-or-fonce">{product.categoryLabel}</p>
          <h1 className="titre mt-4 text-[clamp(2.6rem,5vw,4rem)]">{product.name}</h1>
          <p className="prix mt-4 font-serif text-3xl">{formatPrice(product.price)}</p>
          <p className="mt-1 text-sm text-douce">Prix à l’unité · tarifs de gros sur demande</p>

          <p className="mt-8 leading-relaxed text-douce">{product.description}</p>

          {product.option && (
            <fieldset className="mt-8">
              <legend className="text-sm">
                <span className="font-medium">{product.option.name}</span>
                <span className="text-douce"> : {variant}</span>
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.option.values.map((v) => (
                  <button
                    key={v.label}
                    type="button"
                    aria-pressed={variant === v.label}
                    onClick={() => chooseVariant(v.label, v.image)}
                    className={`min-h-11 rounded-xl border px-4 text-sm transition-colors ${
                      variant === v.label ? "border-encre bg-encre text-ivoire" : "border-filet hover:border-encre"
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <div className="mt-8 flex items-center gap-4">
            <span className="text-sm font-medium">Quantité</span>
            <Quantity value={quantity} onChange={setQuantity} label={product.name} />
          </div>

          <div className="mt-8 grid gap-3">
            <button type="button" onClick={addToCart} className="bouton bouton-nuit w-full">
              {added ? (
                <>
                  <IconCheck width={18} height={18} /> Ajouté à ma commande
                </>
              ) : (
                <>
                  <IconPlus width={16} height={16} /> Ajouter à ma commande
                </>
              )}
            </button>
            <a href={directOrder} target="_blank" rel="noopener noreferrer" className="bouton bouton-whatsapp w-full">
              <IconWhatsApp width={18} height={18} /> Commander sur WhatsApp
            </a>
          </div>

          <ul className="mt-10 divide-y divide-filet border-y border-filet text-sm">
            <li className="flex gap-4 py-4">
              <IconChat width={20} height={20} className="shrink-0 text-or-fonce" />
              <span>
                <strong className="font-medium">Disponibilité confirmée sur WhatsApp</strong>
                <span className="block text-douce">Photo ou vidéo de l’article sur simple demande.</span>
              </span>
            </li>
            <li className="flex gap-4 py-4">
              <IconStore width={20} height={20} className="shrink-0 text-or-fonce" />
              <span>
                <strong className="font-medium">Retrait en boutique ou livraison</strong>
                <span className="block text-douce">{site.delivery}</span>
              </span>
            </li>
            <li className="flex gap-4 py-4">
              <IconTag width={20} height={20} className="shrink-0 text-or-fonce" />
              <span>
                <strong className="font-medium">Vous achetez en quantité ?</strong>
                <span className="block text-douce">
                  Indiquez les quantités dans votre message : nous vous proposons le prix de gros.
                </span>
              </span>
            </li>
          </ul>

          <details className="group mt-2 border-b border-filet" open>
            <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-sm font-medium">
              Détails
              <IconPlus width={16} height={16} className="transition-transform group-open:rotate-45" />
            </summary>
            <ul className="space-y-2 pb-5 text-sm text-douce">
              {product.details.map((d) => (
                <li key={d} className="flex items-center gap-3">
                  <span className="size-1 rounded-full bg-or" /> {d}
                </li>
              ))}
            </ul>
          </details>
          <details className="group border-b border-filet">
            <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-sm font-medium">
              Entretien
              <IconPlus width={16} height={16} className="transition-transform group-open:rotate-45" />
            </summary>
            <p className="pb-5 text-sm leading-relaxed text-douce">
              Évitez l’eau, les parfums et les crèmes. Rangez la pièce à part, à l’abri de l’humidité, et
              essuyez-la avec un chiffon doux après usage.
            </p>
          </details>

          <button
            type="button"
            onClick={cart.open}
            className="mt-8 flex items-center gap-2 text-sm text-douce hover:text-encre"
          >
            <IconBag width={18} height={18} /> Voir ma commande ({cart.count})
          </button>
        </div>
      </div>
    </section>
  );
}
