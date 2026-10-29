"use client";

import { startTransition, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { BandeauAnnonce } from "@/components/BandeauAnnonce";
import { ContenuFenetre } from "@/components/FenetreAnnonce";
import { BarreEnregistrement } from "@/components/admin/BarreEnregistrement";
import { ChampLien } from "@/components/admin/ChampLien";
import { ChampPhotos } from "@/components/admin/ChampPhotos";
import { Carte, Champ, Interrupteur, ligneChamps, propsErreur, styleChamp } from "@/components/admin/ui";
import { useEnregistrement } from "@/components/admin/useEnregistrement";
import type { EtatFormulaire } from "@/lib/actions/formulaires";
import { TONS_BANDEAU, type GroupeDestinations, type Lien, type TonBandeau, type TypeAnnonce } from "@/lib/annonces";

export type AnnonceEditee = {
  enabled: boolean;
  title: string;
  text: string;
  image: string;
  lien: Lien;
  tone: TonBandeau;
  /** Premier et dernier jours (AAAA-MM-JJ), vides sans date. */
  startsAt: string;
  endsAt: string;
  /** Date de modification de la fiche à l'ouverture du formulaire ; vide si elle n'a jamais été enregistrée. */
  version: string;
};

const TONS = Object.keys(TONS_BANDEAU) as TonBandeau[];

export function FormulaireAnnonce({
  type,
  annonce,
  destinations,
  aujourdhui,
  action,
}: {
  type: TypeAnnonce;
  annonce: AnnonceEditee;
  destinations: GroupeDestinations[];
  /** Date du jour (AAAA-MM-JJ) : on ne peut pas choisir un dernier jour déjà passé. */
  aujourdhui: string;
  action: (etat: EtatFormulaire, formData: FormData) => Promise<EtatFormulaire>;
}) {
  const bandeau = type === "bandeau";
  const [etat, envoyer, enCours] = useEnregistrement(action, annonce.version);
  const formulaire = useRef<HTMLFormElement>(null);
  // Next.js garde les pages déjà visitées dans le document, masquées : chaque formulaire a ses propres identifiants.
  const uid = useId();
  const ident = (nom: string) => `${uid}${nom}`;
  const [titre, setTitre] = useState(annonce.title);
  const [texte, setTexte] = useState(annonce.text);
  const [ton, setTon] = useState(annonce.tone);
  const [lien, setLien] = useState(annonce.lien);
  const [photos, setPhotos] = useState(annonce.image ? [{ url: annonce.image, alt: "" }] : []);
  const [envoiPhotos, setEnvoiPhotos] = useState(false);
  const [debut, setDebut] = useState(annonce.startsAt);
  const [fin, setFin] = useState(annonce.endsAt);
  const e = etat?.erreurs ?? {};

  // Après un refus, amène la personne au premier champ à corriger.
  useEffect(() => {
    if (etat?.erreurs) formulaire.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
  }, [etat]);

  function soumettre(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const donnees = new FormData(evenement.currentTarget);
    donnees.set("image", photos[0]?.url ?? "");
    startTransition(() => envoyer(donnees));
  }

  const lienApercu = lien.url ? { url: lien.url, label: lien.label.trim() || "En savoir plus" } : undefined;
  const maxTexte = bandeau ? 140 : 400;

  const champTexte = (
    <Champ
      id={ident("text")}
      label={bandeau ? "Message" : "Message (facultatif)"}
      aide={bandeau ? "Une phrase courte : une ligne sur ordinateur, deux sur téléphone." : undefined}
      erreur={e.text}
    >
      <textarea
        id={ident("text")}
        name="text"
        value={texte}
        onChange={(ev) => setTexte(ev.target.value)}
        rows={bandeau ? 2 : 4}
        maxLength={maxTexte}
        placeholder={
          bandeau
            ? "Ex. Nouvel arrivage de bracelets dorés en boutique cette semaine !"
            : "Ex. Plus de 200 nouveaux modèles vous attendent en boutique à Adewui et sur WhatsApp."
        }
        className={styleChamp}
        {...propsErreur(ident("text"), e.text)}
      />
      <p className="prix mt-1 text-right text-xs text-douce">
        {texte.length} / {maxTexte}
      </p>
    </Champ>
  );

  return (
    <form ref={formulaire} onSubmit={soumettre} noValidate className="mx-auto max-w-3xl space-y-5">
      {bandeau ? (
        <Carte titre="Contenu">
          {champTexte}
          <fieldset>
            <legend className="text-sm font-medium">Couleur</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {TONS.map((t) => (
                <label
                  key={t}
                  className={`flex h-11 cursor-pointer items-center gap-2.5 rounded-xl border bg-white px-3.5 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-or ${
                    ton === t ? "border-nuit ring-1 ring-nuit" : "border-filet hover:border-encre/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="tone"
                    value={t}
                    checked={ton === t}
                    onChange={() => setTon(t)}
                    className="sr-only"
                  />
                  <span aria-hidden className={`size-5 rounded-full ring-1 ring-encre/15 ${TONS_BANDEAU[t].classes}`} />
                  {TONS_BANDEAU[t].label}
                </label>
              ))}
            </div>
          </fieldset>
          <ChampLien
            id={ident("lien")}
            label="Lien (facultatif)"
            aide="Affiché après le message, pour en savoir plus."
            destinations={destinations}
            valeur={lien}
            onChange={setLien}
            erreurs={e}
          />
          <div>
            <p className="text-sm font-medium">Aperçu</p>
            <div inert className="mt-2 overflow-hidden rounded-xl border border-filet">
              {texte.trim() ? (
                <BandeauAnnonce bandeau={{ texte: texte.trim(), ton, lien: lienApercu }} apercu />
              ) : (
                <p className="px-4 py-3 text-center text-sm text-douce">Le bandeau s’affichera ici.</p>
              )}
            </div>
          </div>
        </Carte>
      ) : (
        <>
          <Carte
            titre="Photo"
            description="Facultative, en haut de la fenêtre : une photo de l’arrivage ou de l’article en promotion attire l’œil."
          >
            <ChampPhotos
              id={ident("image")}
              dossier="annonces"
              max={1}
              photos={photos}
              onChange={setPhotos}
              onEnvoi={setEnvoiPhotos}
              erreur={e.image}
            />
          </Carte>

          <Carte titre="Contenu">
            <Champ id={ident("title")} label="Titre" erreur={e.title}>
              <input
                id={ident("title")}
                name="title"
                value={titre}
                onChange={(ev) => setTitre(ev.target.value)}
                maxLength={80}
                placeholder="Ex. Grand arrivage de rentrée"
                className={styleChamp}
                {...propsErreur(ident("title"), e.title)}
              />
            </Champ>
            {champTexte}
            <ChampLien
              id={ident("lien")}
              label="Bouton (facultatif)"
              aide="Sans bouton, la fenêtre propose seulement de la fermer."
              destinations={destinations}
              valeur={lien}
              onChange={setLien}
              erreurs={e}
            />
          </Carte>

          <Carte titre="Aperçu">
            <div inert className="rounded-xl bg-nuit/85 px-4 py-6 sm:px-8 sm:py-10">
              <div className="mx-auto w-full max-w-[26rem] overflow-hidden rounded-2xl bg-ivoire shadow-2xl">
                <ContenuFenetre
                  apercu
                  fenetre={{
                    titre: titre.trim() || "Titre de la fenêtre",
                    texte: texte.trim(),
                    image: photos[0]?.url,
                    lien: lienApercu,
                  }}
                />
              </div>
            </div>
          </Carte>
        </>
      )}

      <Carte titre="Affichage">
        <Interrupteur
          name="enabled"
          label={bandeau ? "Afficher le bandeau" : "Ouvrir la fenêtre sur le site"}
          description={
            bandeau
              ? "Décoché, le bandeau reste enregistré ici mais n’apparaît plus sur le site."
              : "Elle s’ouvre une seule fois par visiteur, un instant après son arrivée. Après chaque modification, chacun la revoit une fois."
          }
          defaultChecked={annonce.enabled}
        />
        <div className={ligneChamps}>
          <Champ
            id={ident("startsAt")}
            label="Premier jour (facultatif)"
            aide="Sans date, dès l’enregistrement."
            erreur={e.startsAt}
          >
            <input
              id={ident("startsAt")}
              name="startsAt"
              type="date"
              value={debut}
              onChange={(ev) => setDebut(ev.target.value)}
              className={styleChamp}
              {...propsErreur(ident("startsAt"), e.startsAt)}
            />
          </Champ>
          <Champ
            id={ident("endsAt")}
            label="Dernier jour (facultatif)"
            aide={bandeau ? "Le bandeau disparaît seul le soir de ce jour." : "La fenêtre ne s’ouvre plus après ce jour."}
            erreur={e.endsAt}
          >
            <input
              id={ident("endsAt")}
              name="endsAt"
              type="date"
              min={debut > aujourdhui ? debut : aujourdhui}
              value={fin}
              onChange={(ev) => setFin(ev.target.value)}
              className={styleChamp}
              {...propsErreur(ident("endsAt"), e.endsAt)}
            />
          </Champ>
        </div>
      </Carte>

      <BarreEnregistrement etat={etat} enCours={enCours} retour="/admin/annonces" bloque={envoiPhotos}>
        {enCours ? "Enregistrement…" : envoiPhotos ? "Envoi de la photo…" : "Enregistrer"}
      </BarreEnregistrement>
    </form>
  );
}
