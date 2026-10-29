"use client";

import { startTransition, useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import { BarreEnregistrement } from "@/components/admin/BarreEnregistrement";
import { Carte, Champ, propsErreur, styleChamp } from "@/components/admin/ui";
import { useEnregistrement } from "@/components/admin/useEnregistrement";
import type { EtatFormulaire } from "@/lib/actions/formulaires";
import {
  chiffresTelephone,
  compteTikTok,
  formaterTelephone,
  planParDefaut,
  type ReglagesBoutique,
} from "@/lib/boutique";

export function FormulaireCoordonnees({
  reglages,
  version,
  action,
}: {
  reglages: ReglagesBoutique;
  /** Date de modification de la fiche ; vide tant que la boutique n'a rien enregistré. */
  version: string;
  action: (etat: EtatFormulaire, formData: FormData) => Promise<EtatFormulaire>;
}) {
  const [etat, envoyer, enCours] = useEnregistrement(action, version);
  const formulaire = useRef<HTMLFormElement>(null);
  const uid = useId();
  const ident = (nom: string) => `${uid}${nom}`;
  const [telephone, setTelephone] = useState(reglages.phone);
  const [whatsapp, setWhatsapp] = useState(formaterTelephone(reglages.whatsapp));
  const [adresse, setAdresse] = useState(reglages.address);
  const [ville, setVille] = useState(reglages.city);
  const [plan, setPlan] = useState(reglages.mapsUrl);
  const [tiktok, setTiktok] = useState(`@${reglages.tiktok}`);
  const e = etat?.erreurs ?? {};

  useEffect(() => {
    if (etat?.erreurs) formulaire.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
  }, [etat]);

  function soumettre(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const donnees = new FormData(evenement.currentTarget);
    startTransition(() => envoyer(donnees));
  }

  /** Remet le numéro saisi en forme (« 92286363 » → « +228 92 28 63 63 ») quand on quitte le champ. */
  const mettreEnForme = (valeur: string, modifier: (v: string) => void) => {
    const chiffres = chiffresTelephone(valeur);
    if (chiffres) modifier(formaterTelephone(chiffres));
  };

  const chiffresWhatsapp = chiffresTelephone(whatsapp);
  const compte = compteTikTok(tiktok);
  const lienPlan = /^https:\/\//.test(plan.trim()) ? plan.trim() : planParDefaut(adresse, ville);

  return (
    <form ref={formulaire} onSubmit={soumettre} noValidate className="mx-auto max-w-3xl space-y-5">
      <Carte titre="Téléphone et WhatsApp" description="Affichés dans l’en-tête, le pied de page et la page Contact.">
        <Champ
          id={ident("phone")}
          label="Téléphone"
          aide="Numéro à appeler. 8 chiffres pour un numéro du Togo."
          erreur={e.phone}
        >
          <input
            id={ident("phone")}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="off"
            value={telephone}
            onChange={(ev) => setTelephone(ev.target.value)}
            onBlur={() => mettreEnForme(telephone, setTelephone)}
            className={styleChamp}
            {...propsErreur(ident("phone"), e.phone)}
          />
        </Champ>
        <Champ
          id={ident("whatsapp")}
          label="WhatsApp"
          aide="Numéro qui reçoit les commandes. Souvent le même que le téléphone."
          erreur={e.whatsapp}
        >
          <input
            id={ident("whatsapp")}
            name="whatsapp"
            type="tel"
            inputMode="tel"
            autoComplete="off"
            value={whatsapp}
            onChange={(ev) => setWhatsapp(ev.target.value)}
            onBlur={() => mettreEnForme(whatsapp, setWhatsapp)}
            className={styleChamp}
            {...propsErreur(ident("whatsapp"), e.whatsapp)}
          />
          {chiffresWhatsapp && (
            <LienTest href={`https://wa.me/${chiffresWhatsapp}`}>Ouvrir la conversation pour vérifier</LienTest>
          )}
        </Champ>
      </Carte>

      <Carte titre="La boutique" description="Adresse, plan et horaires : pied de page, page Contact, panier et FAQ.">
        <Champ id={ident("address")} label="Adresse" aide="Quartier d’abord, puis le repère : « Adewui, dans la VON… »." erreur={e.address}>
          <input
            id={ident("address")}
            name="address"
            value={adresse}
            onChange={(ev) => setAdresse(ev.target.value)}
            maxLength={120}
            className={styleChamp}
            {...propsErreur(ident("address"), e.address)}
          />
        </Champ>
        <Champ id={ident("city")} label="Ville" erreur={e.city}>
          <input
            id={ident("city")}
            name="city"
            value={ville}
            onChange={(ev) => setVille(ev.target.value)}
            maxLength={60}
            className={styleChamp}
            {...propsErreur(ident("city"), e.city)}
          />
        </Champ>
        <Champ
          id={ident("mapsUrl")}
          label="Lien du plan (facultatif)"
          aide="Dans Google Maps, touchez « Partager » sur la boutique et collez le lien ici. Vide : le plan cherche l’adresse."
          erreur={e.mapsUrl}
        >
          <input
            id={ident("mapsUrl")}
            name="mapsUrl"
            type="url"
            inputMode="url"
            value={plan}
            onChange={(ev) => setPlan(ev.target.value)}
            placeholder="https://maps.app.goo.gl/…"
            className={styleChamp}
            {...propsErreur(ident("mapsUrl"), e.mapsUrl)}
          />
          <LienTest href={lienPlan}>Voir le plan</LienTest>
        </Champ>
        <Champ id={ident("hours")} label="Horaires" aide="Par exemple « Du lundi au samedi, de 8 h à 19 h »." erreur={e.hours}>
          <input
            id={ident("hours")}
            name="hours"
            defaultValue={reglages.hours}
            maxLength={80}
            className={styleChamp}
            {...propsErreur(ident("hours"), e.hours)}
          />
        </Champ>
        <Champ
          id={ident("delivery")}
          label="Retrait et livraison"
          aide="Une ou deux phrases, affichées sur chaque fiche article."
          erreur={e.delivery}
        >
          <textarea
            id={ident("delivery")}
            name="delivery"
            defaultValue={reglages.delivery}
            rows={3}
            maxLength={300}
            className={styleChamp}
            {...propsErreur(ident("delivery"), e.delivery)}
          />
        </Champ>
      </Carte>

      <Carte titre="TikTok">
        <Champ id={ident("tiktok")} label="Compte TikTok" erreur={e.tiktok}>
          <input
            id={ident("tiktok")}
            name="tiktok"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={tiktok}
            onChange={(ev) => setTiktok(ev.target.value)}
            className={styleChamp}
            {...propsErreur(ident("tiktok"), e.tiktok)}
          />
          {compte && <LienTest href={`https://www.tiktok.com/@${compte}`}>Ouvrir le compte</LienTest>}
        </Champ>
      </Carte>

      <p className="px-1 text-sm leading-relaxed text-douce">
        Le numéro, l’adresse et le compte TikTok sont aussi cités dans certaines réponses de la FAQ : pensez à les y
        modifier.
      </p>

      <BarreEnregistrement etat={etat} enCours={enCours} retour="/admin">
        {enCours ? "Enregistrement…" : "Enregistrer"}
      </BarreEnregistrement>
    </form>
  );
}

function LienTest({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-sm text-or-fonce underline-offset-4 hover:underline"
    >
      {children} <ExternalLink size={14} aria-hidden />
    </a>
  );
}
