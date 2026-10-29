import Link from "next/link";
import type { ReactNode } from "react";

type Crumb = { href?: string; label: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Fil d’Ariane" className="text-xs text-douce">
      <ol className="flex flex-wrap items-center gap-2">
        {[{ href: "/", label: "Accueil" }, ...items].map((item, i, all) => (
          <li key={item.label} className="flex items-center gap-2">
            {item.href && i < all.length - 1 ? (
              <Link href={item.href} className="hover:text-or-fonce">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-encre">
                {item.label}
              </span>
            )}
            {i < all.length - 1 && <span aria-hidden>/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHeader({
  eyebrow,
  title,
  intro,
  crumbs,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  crumbs: Crumb[];
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-filet">
      <div className="conteneur pt-8 pb-14 md:pt-10 md:pb-20">
        <Breadcrumbs items={crumbs} />
        <p className="eyebrow mt-9 animate-monte text-or-fonce md:mt-16">{eyebrow}</p>
        <h1 className="titre mt-5 max-w-4xl animate-monte text-[clamp(2.75rem,7vw,5.75rem)] [animation-delay:80ms]">
          {title}
        </h1>
        {intro && (
          <div className="mt-6 max-w-2xl animate-monte text-base leading-relaxed text-douce [animation-delay:160ms] md:text-lg">
            {intro}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
