"use client";

import type { FormEvent } from "react";
import { IconWhatsApp } from "@/components/icons";
import { site } from "@/lib/site";
import { whatsappUrl } from "@/lib/whatsapp";

const activites = ["Revendeuse", "Boutique / salon", "Mariage / événement", "Cadeaux d’entreprise", "Autre"];
const volumes = ["Moins de 20 pièces", "20 à 50 pièces", "50 à 100 pièces", "Plus de 100 pièces"];

const field =
  "mt-1.5 block h-12 w-full rounded-xl border border-filet bg-ivoire px-4 text-base outline-none placeholder:text-douce/70 focus:border-or";

/** `categories` : noms des catégories du catalogue, proposés en cases à cocher. */
export function WholesaleForm({ categories }: { categories: string[] }) {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const articles = d.getAll("articles").map(String);
    const message = [
      `Bonjour ${site.name} !`,
      "",
      "Je souhaite recevoir vos tarifs de gros.",
      `Nom : ${d.get("nom")}`,
      `Activité : ${d.get("activite")}`,
      `Ville : ${d.get("ville")}`,
      `Articles : ${articles.length ? articles.join(", ") : "à définir"}`,
      `Quantité estimée : ${d.get("volume")}`,
      d.get("message") ? `Précisions : ${d.get("message")}` : "",
      "",
      "Merci !",
    ]
      .filter((line, i, all) => line !== "" || all[i - 1] !== "")
      .join("\n");
    window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-filet bg-ivoire p-6 shadow-xl shadow-nuit/5 md:p-10">
      <p className="titre text-3xl">Demander les tarifs de gros</p>
      <p className="mt-2 text-sm text-douce">Votre demande s’ouvre dans WhatsApp, prête à être envoyée.</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-sm font-medium">Nom ou nom de la boutique</span>
          <input name="nom" required autoComplete="name" className={field} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Activité</span>
          <select name="activite" required defaultValue="" className={field}>
            <option value="" disabled>
              Choisir…
            </option>
            {activites.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">Ville</span>
          <input name="ville" required defaultValue="Lomé" className={field} />
        </label>
      </div>

      <fieldset className="mt-6">
        <legend className="text-sm font-medium">Articles qui vous intéressent</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {categories.map((label) => (
            <label key={label} className="cursor-pointer">
              <input type="checkbox" name="articles" value={label} className="peer sr-only" />
              <span className="inline-flex min-h-10 items-center rounded-full border border-filet px-4 text-sm transition-colors peer-checked:border-encre peer-checked:bg-encre peer-checked:text-ivoire peer-focus-visible:outline-2 peer-focus-visible:outline-or hover:border-encre">
                {label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="mt-6 block">
        <span className="text-sm font-medium">Quantité estimée</span>
        <select name="volume" required defaultValue="" className={field}>
          <option value="" disabled>
            Choisir…
          </option>
          {volumes.map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </label>

      <label className="mt-6 block">
        <span className="text-sm font-medium">
          Précisions <span className="font-normal text-douce">(facultatif)</span>
        </span>
        <textarea
          name="message"
          rows={3}
          placeholder="Coloris, budget, date de l’événement…"
          className="mt-1.5 block w-full resize-none rounded-xl border border-filet bg-ivoire px-4 py-3 text-base outline-none placeholder:text-douce/70 focus:border-or"
        />
      </label>

      <button type="submit" className="bouton bouton-whatsapp mt-8 w-full">
        <IconWhatsApp width={18} height={18} /> Envoyer ma demande
      </button>
    </form>
  );
}
