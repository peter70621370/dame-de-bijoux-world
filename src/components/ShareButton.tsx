"use client";

import { useState } from "react";
import { IconCheck, IconShare } from "./icons";

/**
 * Partage natif sur mobile (WhatsApp, TikTok…) ; sur ordinateur,
 * copie le lien de la fiche et le confirme par une coche.
 */
export function ShareButton({ title, path, className = "" }: { title: string; path: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = new URL(path, window.location.origin).toString();
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // Partage annulé par la cliente : rien à faire.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copiez le lien de l’article :", url);
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      aria-label={copied ? "Lien copié" : `Partager ${title}`}
      title={copied ? "Lien copié" : "Partager"}
      className={`grid size-10 place-items-center rounded-full bg-white/95 text-encre shadow-md shadow-nuit/10 backdrop-blur transition-colors hover:bg-white hover:text-or-fonce ${className}`}
    >
      {copied ? <IconCheck width={17} height={17} className="text-[#1f8f4e]" /> : <IconShare width={17} height={17} />}
    </button>
  );
}
