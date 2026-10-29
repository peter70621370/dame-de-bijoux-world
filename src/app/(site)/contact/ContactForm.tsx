"use client";

import type { FormEvent } from "react";
import { IconWhatsApp } from "@/components/icons";
import { site } from "@/lib/site";
import { whatsappUrl } from "@/lib/whatsapp";

const sujets = ["Une commande", "Les tarifs de gros", "Un article sur demande", "Autre question"];

export function ContactForm() {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const message = `Bonjour ${site.name}, je suis ${d.get("nom")}.\nSujet : ${d.get("sujet")}\n\n${d.get("message")}`;
    window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
  }

  const field =
    "mt-1.5 block w-full rounded-xl border border-filet bg-ivoire px-4 text-base outline-none placeholder:text-douce/70 focus:border-or";

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-filet bg-ivoire p-6 shadow-xl shadow-nuit/5 md:p-10">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">Votre nom</span>
          <input name="nom" required autoComplete="name" className={`${field} h-12`} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Sujet</span>
          <select name="sujet" className={`${field} h-12`}>
            {sujets.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="mt-5 block">
        <span className="text-sm font-medium">Votre message</span>
        <textarea name="message" required rows={5} className={`${field} resize-none py-3`} />
      </label>
      <button type="submit" className="bouton bouton-whatsapp mt-8 w-full">
        <IconWhatsApp width={18} height={18} /> Envoyer sur WhatsApp
      </button>
    </form>
  );
}
