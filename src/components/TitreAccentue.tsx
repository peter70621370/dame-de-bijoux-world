import { morceauxTitre } from "@/lib/accueil";

/** Titre saisi dans le back-office : les mots entre astérisques passent en italique. */
export function TitreAccentue({ titre }: { titre: string }) {
  return morceauxTitre(titre).map((m, i) => (m.accent ? <em key={i}>{m.texte}</em> : m.texte));
}
