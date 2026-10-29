import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/PageHeader";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { JsonLd } from "@/components/JsonLd";
import { getCategory, getProduct, products, relatedProducts } from "@/lib/products";
import { site } from "@/lib/site";
import { ProductView } from "./ProductView";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/selection/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  const title = `${product.name} — ${product.price.toLocaleString("fr-FR")} FCFA`;
  return {
    title,
    description: `${product.short} ${product.price.toLocaleString("fr-FR")} FCFA, en gros ou au détail. Commandez sur WhatsApp, retrait à Lomé ou livraison.`,
    alternates: { canonical: `/selection/${product.slug}` },
    openGraph: {
      title,
      description: product.short,
      images: [{ url: product.images[0].src, alt: product.images[0].alt }],
    },
  };
}

export default function ProductPage({ params }: PageProps<"/selection/[slug]">) {
  // Le squelette s'affiche instantanément pendant la navigation client.
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductContent params={params} />
    </Suspense>
  );
}

function ProductSkeleton() {
  return (
    <div className="conteneur grid animate-pulse gap-10 pt-16 pb-20 lg:grid-cols-12 lg:gap-16" aria-hidden>
      <div className="aspect-[4/5] rounded-2xl bg-sable lg:col-span-7" />
      <div className="space-y-5 lg:col-span-5">
        <div className="h-3 w-24 rounded bg-sable" />
        <div className="h-14 w-4/5 rounded-xl bg-sable" />
        <div className="h-8 w-32 rounded-lg bg-sable" />
        <div className="h-24 w-full rounded-xl bg-sable" />
      </div>
    </div>
  );
}

async function ProductContent({ params }: { params: PageProps<"/selection/[slug]">["params"] }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const category = getCategory(product.category);
  const related = relatedProducts(product);

  return (
    <>
      <div className="conteneur pt-8">
        <Breadcrumbs
          items={[
            { href: "/selection", label: "Sélection" },
            { href: `/selection?categorie=${category.id}`, label: category.label },
            { label: product.name },
          ]}
        />
      </div>

      <ProductView product={product} />

      <section className="border-t border-filet bg-sable/50">
        <div className="conteneur py-20 md:py-24">
          <Reveal>
            <p className="eyebrow text-or-fonce">À associer</p>
            <h2 className="titre mt-4 text-[clamp(2.3rem,4.5vw,3.75rem)]">Vous aimerez aussi</h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => (
              <Reveal key={p.slug} delay={i * 90}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description,
          image: product.images.map((i) => `${site.url}${i.src}`),
          category: category.label,
          brand: { "@type": "Brand", name: site.name },
          offers: {
            "@type": "Offer",
            url: `${site.url}/selection/${product.slug}`,
            priceCurrency: "XOF",
            price: product.price,
            availability: "https://schema.org/InStock",
            seller: { "@type": "Organization", name: site.name },
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: site.url },
            { "@type": "ListItem", position: 2, name: "Sélection", item: `${site.url}/selection` },
            { "@type": "ListItem", position: 3, name: product.name },
          ],
        }}
      />
    </>
  );
}
