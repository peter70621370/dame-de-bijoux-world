import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NouvelleVisite } from "@/components/admin/NouvelleVisite";
import { EnTete } from "@/components/admin/ui";
import { enregistrerAnnonce } from "@/lib/actions/annonces";
import { estTypeAnnonce, TONS_BANDEAU, type TonBandeau } from "@/lib/annonces";
import { getAnnonce, getDestinations } from "@/lib/data/admin";
import { aujourdhui, jourDe } from "@/lib/dates";
import { FormulaireAnnonce } from "../FormulaireAnnonce";

export async function generateMetadata({ params }: PageProps<"/admin/annonces/[type]">): Promise<Metadata> {
  const { type } = await params;
  return { title: type === "fenetre" ? "Fenêtre à l’ouverture" : "Bandeau" };
}

export default async function AnnoncePage({ params }: PageProps<"/admin/annonces/[type]">) {
  const { type } = await params;
  if (!estTypeAnnonce(type)) notFound();
  const [annonce, destinations] = await Promise.all([getAnnonce(type), getDestinations()]);
  const bandeau = type === "bandeau";

  return (
    <div className="space-y-6 md:space-y-8">
      <EnTete
        retour={{ href: "/admin/annonces", label: "Bandeau & fenêtre" }}
        surtitre="Annonces"
        titre={bandeau ? "Bandeau" : "Fenêtre à l’ouverture"}
        description={
          bandeau
            ? "Une ligne au-dessus du menu, sur toutes les pages du site."
            : "S’ouvre une fois par visiteur, un instant après son arrivée sur le site."
        }
      />

      <NouvelleVisite>
        <FormulaireAnnonce
          type={type}
          destinations={destinations}
          aujourdhui={aujourdhui()}
          action={enregistrerAnnonce.bind(null, type)}
          annonce={{
            // Première rédaction : on l'écrit pour la montrer.
            enabled: annonce?.enabled ?? true,
            title: annonce?.title ?? "",
            text: annonce?.text ?? "",
            image: annonce?.image ?? "",
            lien: { label: annonce?.linkLabel ?? "", url: annonce?.linkUrl ?? "" },
            tone: annonce && annonce.tone in TONS_BANDEAU ? (annonce.tone as TonBandeau) : "nuit",
            startsAt: annonce?.startsAt ? jourDe(annonce.startsAt) : "",
            endsAt: annonce?.endsAt ? jourDe(annonce.endsAt) : "",
            version: annonce?.updatedAt.toISOString() ?? "",
          }}
        />
      </NouvelleVisite>
    </div>
  );
}
