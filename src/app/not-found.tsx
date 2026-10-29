import Link from "next/link";
import { IconArrow } from "@/components/icons";

export default function NotFound() {
  return (
    <section className="conteneur flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="prix font-serif text-[8rem] leading-none text-or/40">404</p>
      <h1 className="titre mt-4 text-5xl">Cette page s’est égarée</h1>
      <p className="mt-4 max-w-md text-douce">
        Comme une boucle d’oreille au fond d’un sac… La page que vous cherchez n’existe pas ou a été déplacée.
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link href="/selection" className="bouton bouton-nuit">
          Voir la sélection <IconArrow width={16} height={16} />
        </Link>
        <Link href="/" className="bouton bouton-contour">
          Retour à l’accueil
        </Link>
      </div>
    </section>
  );
}
