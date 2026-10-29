"use client";

import { useState } from "react";
import type { GroupeDestinations, Lien } from "@/lib/annonces";
import { Champ, propsErreur, styleChamp } from "./ui";

const AUTRE = "autre";

/**
 * Lien d'une annonce : une page du site choisie dans la liste, dont le texte de lien se propose seul, ou une autre
 * adresse. Envoie les champs `linkUrl` et `linkLabel`.
 */
export function ChampLien({
  id,
  label,
  aide,
  destinations,
  valeur,
  onChange,
  erreurs,
}: {
  id: string;
  label: string;
  aide?: string;
  destinations: GroupeDestinations[];
  valeur: Lien;
  onChange: (lien: Lien) => void;
  erreurs: Record<string, string>;
}) {
  const toutes = destinations.flatMap((g) => g.destinations);
  const [autre, setAutre] = useState(valeur.url !== "" && !toutes.some((d) => d.url === valeur.url));
  // Le texte proposé suit la page choisie, jusqu'à ce que la personne écrive le sien.
  const [texteSaisi, setTexteSaisi] = useState(valeur.label !== "" && !toutes.some((d) => d.texte === valeur.label));

  function choisir(choix: string) {
    setAutre(choix === AUTRE);
    const url = choix === AUTRE ? "" : choix;
    const proposition = toutes.find((d) => d.url === url)?.texte ?? "";
    onChange({ url, label: texteSaisi ? valeur.label : proposition });
  }

  const erreurAdresse = erreurs.linkUrl;
  return (
    <div className="space-y-4">
      <Champ id={`${id}-page`} label={label} aide={aide} erreur={autre ? undefined : erreurAdresse}>
        <select
          id={`${id}-page`}
          value={autre ? AUTRE : valeur.url}
          onChange={(e) => choisir(e.target.value)}
          className={styleChamp}
          {...propsErreur(`${id}-page`, autre ? undefined : erreurAdresse)}
        >
          <option value="">Pas de lien</option>
          {destinations.map((g) => (
            <optgroup key={g.groupe} label={g.groupe}>
              {g.destinations.map((d) => (
                <option key={d.url} value={d.url}>
                  {d.label}
                </option>
              ))}
            </optgroup>
          ))}
          <option value={AUTRE}>Autre adresse…</option>
        </select>
      </Champ>

      {autre && (
        <Champ
          id={`${id}-adresse`}
          label="Adresse"
          aide="Une page du site (« /selection ») ou une adresse complète commençant par https://."
          erreur={erreurAdresse}
        >
          <input
            id={`${id}-adresse`}
            inputMode="url"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={valeur.url}
            maxLength={500}
            onChange={(e) => onChange({ ...valeur, url: e.target.value.trim() })}
            placeholder="https://"
            className={styleChamp}
            {...propsErreur(`${id}-adresse`, erreurAdresse)}
          />
        </Champ>
      )}

      {(autre || valeur.url) && (
        <Champ id={`${id}-texte`} label="Texte du lien" erreur={erreurs.linkLabel}>
          <input
            id={`${id}-texte`}
            name="linkLabel"
            value={valeur.label}
            maxLength={40}
            onChange={(e) => {
              setTexteSaisi(e.target.value !== "");
              onChange({ ...valeur, label: e.target.value });
            }}
            placeholder="En savoir plus"
            className={`${styleChamp} sm:max-w-80`}
            {...propsErreur(`${id}-texte`, erreurs.linkLabel)}
          />
        </Champ>
      )}
      <input type="hidden" name="linkUrl" value={valeur.url} />
    </div>
  );
}
