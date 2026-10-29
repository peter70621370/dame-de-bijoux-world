import Link from "next/link";

// Rubrique réservée aux administrateurs (pages du site, comptes) ouverte par un utilisateur simple : voir verifyAdmin.
export default function AccesReserve() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="eyebrow text-or-fonce">Accès réservé</p>
      <h1 className="titre mt-3 text-4xl">Réservé aux administrateurs</h1>
      <p className="mt-3 text-douce">
        Votre compte peut gérer le catalogue et les annonces. Pour cette rubrique, adressez-vous à un administrateur.
      </p>
      <Link href="/admin" className="bouton bouton-nuit mt-8">
        Tableau de bord
      </Link>
    </div>
  );
}
