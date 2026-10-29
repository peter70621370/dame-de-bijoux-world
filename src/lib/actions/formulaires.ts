import { z } from "zod";

// Outils partagés par les actions des formulaires du back-office.

/**
 * Réponse d'une action de formulaire : message général, erreurs par champ, ou confirmation.
 * `version` : date de modification de la fiche enregistrée ; `conflit` : la fiche a changé ailleurs entre-temps.
 */
export type EtatFormulaire =
  | { message?: string; erreurs?: Record<string, string>; ok?: string; version?: string; conflit?: boolean }
  | undefined;

/** Première erreur de chaque champ, sous la forme { nomDuChamp: message }. */
export function erreursParChamp(issues: z.ZodError["issues"]) {
  const erreurs: Record<string, string> = {};
  for (const issue of issues) erreurs[String(issue.path[0] ?? "formulaire")] ??= issue.message;
  return erreurs;
}

function enChiffres(texte: string) {
  // Accepte « 1 500 », « 1.500 » ou « 1500 FCFA ».
  return texte.replace(/fcfa/i, "").replace(/[\s  .]/g, "");
}

/** Montant en FCFA obligatoire. */
export function montant(message: string) {
  return z.string().transform((texte, ctx) => {
    const chiffres = enChiffres(texte);
    const valeur = Number(chiffres);
    if (!/^\d+$/.test(chiffres) || valeur < 1 || valeur > 10_000_000) {
      ctx.addIssue({ code: "custom", message });
      return z.NEVER;
    }
    return valeur;
  });
}

/** Montant en FCFA facultatif : vide donne null. */
export function montantFacultatif(message: string) {
  return z.string().transform((texte, ctx) => {
    const chiffres = enChiffres(texte);
    if (chiffres === "") return null;
    const valeur = Number(chiffres);
    if (!/^\d+$/.test(chiffres) || valeur < 1 || valeur > 10_000_000) {
      ctx.addIssue({ code: "custom", message });
      return z.NEVER;
    }
    return valeur;
  });
}

/** Champ caché contenant du JSON (listes de photos, de valeurs…), validé par `schema`. */
export function enJson<T extends z.ZodType>(schema: T) {
  return z
    .string()
    .transform((texte, ctx) => {
      try {
        return JSON.parse(texte) as unknown;
      } catch {
        ctx.addIssue({ code: "custom", message: "Données illisibles : rechargez la page." });
        return z.NEVER;
      }
    })
    .pipe(schema);
}

/** Dernière seconde du jour choisi (AAAA-MM-JJ) à Lomé, qui vit à l'heure UTC toute l'année. */
export function finDeJournee(jour: string) {
  return new Date(`${jour}T23:59:59.999Z`);
}

/** Minuit au début du jour choisi (AAAA-MM-JJ), à Lomé. */
export function debutDeJournee(jour: string) {
  return new Date(`${jour}T00:00:00.000Z`);
}

/** Première phrase d'un texte, pour les aperçus (Google, partages) quand le résumé est vide. */
export function premierePhrase(texte: string) {
  const phrase = texte.split(/(?<=[.!?])\s/)[0] ?? "";
  return phrase.length > 160 ? `${phrase.slice(0, 157).trimEnd()}…` : phrase;
}
