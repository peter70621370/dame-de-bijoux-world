import Link from "next/link";

// Fiche ou page inconnue dans le back-office (article supprimé entre-temps, adresse mal recopiée…).
export default function Introuvable() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="eyebrow text-or-fonce">Introuvable</p>
      <h1 className="titre mt-3 text-4xl">Cette page n’existe pas</h1>
      <p className="mt-3 text-douce">L’élément demandé a peut-être été supprimé.</p>
      <Link href="/admin" className="bouton bouton-nuit mt-8">
        Tableau de bord
      </Link>
    </div>
  );
}
