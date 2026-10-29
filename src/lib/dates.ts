// Dates affichées sur le site et dans le back-office, à l'heure de Lomé (UTC toute l'année).

const jour = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", timeZone: "Africa/Lome" });
const date = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Lome" });

/** « 3 novembre ». */
export const formatJour = (d: Date | string) => jour.format(new Date(d));

/** « 3 novembre 2026 ». */
export const formatDate = (d: Date | string) => date.format(new Date(d));

/** Jour au format des champs de date (AAAA-MM-JJ). */
export const jourDe = (d: Date) => d.toISOString().slice(0, 10);

/** Aujourd'hui, au format des champs de date. */
export const aujourdhui = () => jourDe(new Date());

const dateHeure = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Africa/Lome",
});

/** « 3 novembre 2026 à 14:05 ». */
export const formatDateHeure = (d: Date | string) => dateHeure.format(new Date(d));
