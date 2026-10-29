import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mentions légales",
  alternates: { canonical: "/mentions-legales" },
  robots: { index: false },
};

// Photos libres utilisées en attendant celles de la boutique (licences Creative Commons : crédit obligatoire).
const photoCredits = [
  {
    label: "Colliers",
    author: "KAMGOR GEORGEM",
    source:
      "https://commons.wikimedia.org/wiki/File:HK_SKD_%E5%B0%87%E8%BB%8D%E6%BE%B3_TKO_%E6%97%A5%E5%87%BA%E5%BA%B7%E5%9F%8E_Lohas_Park_shopping_mall_shop_%E5%91%A8%E5%A4%A7%E7%A6%8F%E7%8F%A0%E5%AF%B6_Chow_Tai_Fook_Jewellery_October_2022_Px3_gold_necklace_chain.jpg",
    licence: "CC BY-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0/deed.fr",
  },
  {
    label: "Bagues",
    author: "Andrea",
    source: "https://commons.wikimedia.org/wiki/File:%22_12_-_ITALY_-_gold_ring_(handmade_in_Italy)_hand_female.JPG",
    licence: "CC BY-SA 3.0 IT",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/3.0/it/deed.fr",
  },
  {
    label: "Boucles d’oreilles",
    author: "Nan Palmero",
    source: "https://commons.wikimedia.org/wiki/File:Earrings_on_Display_(16658196064).jpg",
    licence: "CC BY 2.0",
    licenceUrl: "https://creativecommons.org/licenses/by/2.0/deed.fr",
  },
  {
    label: "Parures",
    author: "Karthikasree",
    source: "https://commons.wikimedia.org/wiki/File:Hand_made_bridal_set.jpg",
    licence: "CC BY-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0/deed.fr",
  },
];

export default function MentionsPage() {
  return (
    <>
      <PageHeader crumbs={[{ label: "Mentions légales" }]} eyebrow="Informations" title="Mentions légales" />
      <section className="conteneur max-w-3xl space-y-10 py-16 leading-relaxed text-douce md:py-20">
        <div>
          <h2 className="titre text-3xl text-encre">Éditeur du site</h2>
          <p className="mt-3">
            {site.name}
            <br />
            {site.address}, {site.city} — {site.country}
            <br />
            Téléphone : {site.phone}
          </p>
        </div>
        <div>
          <h2 className="titre text-3xl text-encre">Hébergement</h2>
          <p className="mt-3">Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.</p>
        </div>
        <div>
          <h2 className="titre text-3xl text-encre">Commandes et données personnelles</h2>
          <p className="mt-3">
            Aucune commande ni aucun paiement n’est traité sur ce site. Votre sélection est conservée uniquement
            dans votre navigateur ; lorsque vous l’envoyez, elle est transmise par WhatsApp, selon les conditions
            de ce service. Les informations saisies dans les formulaires (nom, quartier) servent uniquement à
            rédiger votre message et ne sont pas enregistrées par le site.
          </p>
          <p className="mt-3">
            Une mesure d’audience anonyme (Vercel Analytics, sans cookie) permet de connaître la fréquentation des
            pages.
          </p>
        </div>
        <div>
          <h2 className="titre text-3xl text-encre">Photographies</h2>
          <p className="mt-3">
            Les photos présentent les modèles proposés ; de légères différences de teinte peuvent exister selon
            l’écran et les arrivages.
          </p>
          <p id="credits-photos" className="mt-3 scroll-mt-28">
            Photos des univers Colliers, Bagues, Boucles d’oreilles et Parures : Wikimedia Commons, recadrées.
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {photoCredits.map((p) => (
              <li key={p.label}>
                {p.label} —{" "}
                <a href={p.source} target="_blank" rel="noopener noreferrer" className="underline hover:text-or-fonce">
                  photo de {p.author}
                </a>
                ,{" "}
                <a href={p.licenceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-or-fonce">
                  {p.licence}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
