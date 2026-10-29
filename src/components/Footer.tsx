import Link from "next/link";
import { categories } from "@/lib/products";
import { nav, site } from "@/lib/site";
import { greetingUrl } from "@/lib/whatsapp";
import { IconPhone, IconPin, IconTikTok, IconWhatsApp } from "./icons";
import { LogoEmbleme } from "./LogoEmbleme";

export function Footer() {
  return (
    <footer className="grain relative overflow-hidden bg-nuit text-ivoire/80">
      <div className="conteneur relative grid grid-cols-2 gap-x-6 gap-y-12 py-16 md:grid-cols-12 md:gap-12 md:py-24">
        <div className="col-span-2 md:col-span-4">
          <LogoEmbleme className="mb-5 h-16 w-auto text-or" />
          <p className="font-serif text-3xl font-semibold uppercase tracking-[0.12em] text-ivoire">Dame de Bijoux</p>
          <p className="eyebrow mt-2 text-or-clair">World · {site.signature}</p>
          <p className="mt-6 max-w-xs text-sm leading-relaxed">
            Bijoux et accessoires de beauté sélectionnés avec exigence, en gros comme au détail, à{" "}
            {site.city}.
          </p>
          <div className="mt-8 flex gap-3">
            <a
              href={greetingUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="grid size-11 place-items-center rounded-full border border-ivoire/20 transition-colors hover:border-or-clair hover:text-or-clair"
            >
              <IconWhatsApp />
            </a>
            <a
              href={site.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`TikTok ${site.tiktokHandle}`}
              className="grid size-11 place-items-center rounded-full border border-ivoire/20 transition-colors hover:border-or-clair hover:text-or-clair"
            >
              <IconTikTok />
            </a>
          </div>
        </div>

        <div className="md:col-span-2">
          <p className="eyebrow text-or-clair">La boutique</p>
          <ul className="mt-4 space-y-1 text-sm">
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={`/selection?categorie=${c.id}`} className="inline-block py-1.5 hover:text-or-clair">
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <p className="eyebrow text-or-clair">Explorer</p>
          <ul className="mt-4 space-y-1 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="inline-block py-1.5 hover:text-or-clair">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/tiktok" className="inline-block py-1.5 hover:text-or-clair">
                TikTok
              </Link>
            </li>
          </ul>
        </div>

        <div className="col-span-2 md:col-span-4">
          <p className="eyebrow text-or-clair">Nous joindre</p>
          <ul className="mt-5 space-y-4 text-sm">
            <li>
              <a href={site.phoneHref} className="flex items-center gap-3 py-1 hover:text-or-clair">
                <IconPhone width={18} height={18} className="text-or-clair" /> {site.phone}
              </a>
            </li>
            <li>
              <a
                href={site.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-3 hover:text-or-clair"
              >
                <IconPin width={18} height={18} className="mt-0.5 shrink-0 text-or-clair" />
                <span>
                  {site.address}
                  <br />
                  {site.city} — {site.country}
                </span>
              </a>
            </li>
            <li className="pl-[30px] text-ivoire/60">{site.hours}</li>
          </ul>
        </div>
      </div>
      <div className="conteneur relative flex flex-col gap-3 border-t border-ivoire/10 pt-6 pb-28 text-xs md:pb-6 text-ivoire/55 md:flex-row md:items-center md:justify-between">
        <p>© {site.name}. Tous droits réservés.</p>
        <Link href="/mentions-legales" className="inline-block py-1.5 hover:text-or-clair">
          Mentions légales
        </Link>
      </div>
    </footer>
  );
}
