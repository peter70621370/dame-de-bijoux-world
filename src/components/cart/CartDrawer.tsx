"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { formatPrice } from "@/lib/products";
import { orderMessage, whatsappUrl, type OrderCustomer } from "@/lib/whatsapp";
import { site } from "@/lib/site";
import {
  IconArrow,
  IconBag,
  IconCheck,
  IconClose,
  IconMinus,
  IconPlus,
  IconStore,
  IconTrash,
  IconWhatsApp,
} from "../icons";
import { useCart } from "./CartProvider";

export function CartDrawer() {
  const cart = useCart();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [sent, setSent] = useState(false);
  const [mode, setMode] = useState<OrderCustomer["mode"]>("retrait");
  // Garde la saisie si la cliente revient au formulaire après l'envoi.
  const [draft, setDraft] = useState<Partial<OrderCustomer>>({});
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (cart.isOpen && !dialog.open) dialog.showModal();
    if (!cart.isOpen && dialog.open) dialog.close();
  }, [cart.isOpen]);

  function handleClose() {
    cart.close();
    setSent(false);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const customer: OrderCustomer = {
      name: String(data.get("nom") ?? "").trim(),
      mode,
      area: String(data.get("quartier") ?? "").trim(),
      note: String(data.get("remarque") ?? "").trim(),
    };
    const message = orderMessage(
      cart.lines.map((l) => ({
        name: l.product.name,
        variant: l.variant,
        optionName: l.product.option?.name,
        quantity: l.quantity,
        price: l.product.price,
      })),
      customer,
    );
    window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
    setDraft(customer);
    setSent(true);
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) handleClose();
      }}
      aria-labelledby={titleId}
      className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-dvh w-full max-w-[460px] bg-ivoire p-0 sm:rounded-l-2xl text-encre shadow-2xl backdrop:bg-nuit/55 backdrop:backdrop-blur-[2px] open:animate-[tiroir_0.45s_var(--ease-luxe)]"
    >
      <style>{`@keyframes tiroir{from{transform:translateX(100%)}to{transform:none}}`}</style>
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between border-b border-filet px-6 py-5">
          <h2 id={titleId} className="titre text-3xl">
            Ma commande
            {cart.count > 0 && (
              <span className="ml-2 align-middle font-sans text-sm text-douce">
                ({cart.count} article{cart.count > 1 ? "s" : ""})
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="-mr-2 grid size-11 place-items-center hover:text-or-fonce"
            aria-label="Fermer ma commande"
          >
            <IconClose />
          </button>
        </header>

        {sent ? (
          <SentState onDone={() => { cart.clear(); handleClose(); }} onBack={() => setSent(false)} />
        ) : cart.lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-sable text-or-fonce">
              <IconBag width={26} height={26} />
            </span>
            <p className="titre mt-6 text-3xl">Votre commande est vide</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-douce">
              Ajoutez vos pièces préférées, puis envoyez la liste sur WhatsApp en un geste.
            </p>
            <Link href="/selection" onClick={handleClose} className="bouton bouton-nuit mt-8">
              Découvrir la sélection
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <ul className="divide-y divide-filet px-6">
                {cart.lines.map((line) => {
                  const imgIndex =
                    line.product.option?.values.find((v) => v.label === line.variant)?.image ?? 0;
                  const img = line.product.images[imgIndex] ?? line.product.images[0];
                  return (
                    <li key={line.key} className="flex gap-4 py-5">
                      <Link
                        href={`/selection/${line.product.slug}`}
                        onClick={handleClose}
                        className="relative aspect-[4/5] w-20 shrink-0 overflow-hidden rounded-xl bg-sable"
                      >
                        <Image src={img.src} alt="" fill sizes="80px" className="object-cover" />
                      </Link>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-serif text-xl leading-tight">{line.product.name}</p>
                            {line.variant && (
                              <p className="mt-1 text-xs text-douce">
                                {line.product.option?.name} : {line.variant}
                              </p>
                            )}
                          </div>
                          <p className="prix shrink-0 text-sm">
                            {formatPrice(line.product.price * line.quantity)}
                          </p>
                        </div>
                        <div className="mt-auto flex items-center justify-between pt-3">
                          <Quantity
                            value={line.quantity}
                            label={line.product.name}
                            onChange={(q) => cart.setQuantity(line.key, q)}
                          />
                          <button
                            type="button"
                            onClick={() => cart.setQuantity(line.key, 0)}
                            className="flex items-center gap-1.5 text-xs text-douce hover:text-rubis"
                          >
                            <IconTrash width={16} height={16} /> Retirer
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <fieldset className="space-y-4 border-t border-filet bg-sable/60 px-6 py-6">
                <legend className="sr-only">Vos informations</legend>
                <p className="eyebrow text-or-fonce">Pour préparer votre commande</p>
                <label className="block">
                  <span className="text-sm font-medium">Votre prénom et nom</span>
                  <input
                    name="nom"
                    defaultValue={draft.name}
                    required
                    autoComplete="name"
                    className="mt-1.5 block h-12 w-full rounded-xl border border-filet bg-ivoire px-4 text-base outline-none focus:border-or"
                  />
                </label>
                <div role="radiogroup" aria-label="Mode de réception" className="grid grid-cols-2 gap-2">
                  {(
                    [
                      ["retrait", "Retrait boutique"],
                      ["livraison", "Livraison"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={mode === value}
                      onClick={() => setMode(value)}
                      className={`flex h-12 items-center justify-center gap-2 rounded-xl border text-sm transition-colors ${
                        mode === value
                          ? "border-encre bg-encre text-ivoire"
                          : "border-filet bg-ivoire hover:border-encre"
                      }`}
                    >
                      {mode === value && <IconCheck width={16} height={16} />}
                      {label}
                    </button>
                  ))}
                </div>
                {mode === "livraison" ? (
                  <label className="block">
                    <span className="text-sm font-medium">Quartier ou ville de livraison</span>
                    <input
                      name="quartier"
                      defaultValue={draft.area}
                      required
                      placeholder="Ex. Bè, Agoè, Kara…"
                      className="mt-1.5 block h-12 w-full rounded-xl border border-filet bg-ivoire px-4 text-base outline-none placeholder:text-douce/70 focus:border-or"
                    />
                  </label>
                ) : (
                  <p className="flex gap-2 text-sm leading-relaxed text-douce">
                    <IconStore width={18} height={18} className="mt-0.5 shrink-0 text-or-fonce" />
                    {site.address}, {site.city}.
                  </p>
                )}
                <label className="block">
                  <span className="text-sm font-medium">
                    Remarque <span className="font-normal text-douce">(facultatif)</span>
                  </span>
                  <textarea
                    name="remarque"
                    defaultValue={draft.note}
                    rows={2}
                    placeholder="Quantités de gros, date souhaitée, cadeau…"
                    className="mt-1.5 block w-full resize-none rounded-xl border border-filet bg-ivoire px-4 py-3 text-base outline-none placeholder:text-douce/70 focus:border-or"
                  />
                </label>
              </fieldset>
            </div>

            <footer className="border-t border-filet bg-ivoire px-6 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-douce">Total indicatif</span>
                <span className="prix font-serif text-3xl">{formatPrice(cart.total)}</span>
              </div>
              <p className="mt-1 text-xs text-douce">
                Disponibilité et frais de livraison confirmés sur WhatsApp. Aucun paiement en ligne.
              </p>
              <button type="submit" className="bouton bouton-whatsapp mt-4 w-full">
                <IconWhatsApp /> Envoyer sur WhatsApp
              </button>
            </footer>
          </form>
        )}
      </div>
    </dialog>
  );
}

function SentState({ onDone, onBack }: { onDone: () => void; onBack: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-[#1f8f4e] text-white">
        <IconWhatsApp width={28} height={28} />
      </span>
      <p className="titre mt-6 text-3xl">Votre commande est prête</p>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-douce">
        Elle s’est ouverte dans WhatsApp : il ne reste qu’à appuyer sur <strong>Envoyer</strong>.
        Nous vous répondons pour confirmer la disponibilité.
      </p>
      <button type="button" onClick={onDone} className="bouton bouton-nuit mt-8 w-full max-w-xs">
        C’est envoyé <IconCheck width={16} height={16} />
      </button>
      <button type="button" onClick={onBack} className="lien-souligne mt-6 text-douce">
        WhatsApp ne s’est pas ouvert ? Réessayer <IconArrow width={14} height={14} />
      </button>
    </div>
  );
}

export function Quantity({
  value,
  onChange,
  label,
  min = 1,
}: {
  value: number;
  onChange: (n: number) => void;
  label: string;
  min?: number;
}) {
  return (
    <div className="inline-flex h-10 items-center overflow-hidden rounded-xl border border-filet">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        className="grid size-10 place-items-center hover:text-or-fonce disabled:opacity-30"
        aria-label={`Retirer un ${label}`}
      >
        <IconMinus width={16} height={16} />
      </button>
      <span className="prix w-8 text-center text-sm" aria-live="polite" aria-label={`Quantité : ${value}`}>
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="grid size-10 place-items-center hover:text-or-fonce"
        aria-label={`Ajouter un ${label}`}
      >
        <IconPlus width={16} height={16} />
      </button>
    </div>
  );
}

export function CartToast() {
  const cart = useCart();
  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none fixed inset-x-0 top-20 z-50 flex justify-center px-4 transition-all duration-500 ease-[var(--ease-luxe)] md:top-24 md:justify-end md:px-10 ${
        cart.toast ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
      }`}
    >
      {cart.toast && (
        <div className="pointer-events-auto flex w-full max-w-sm items-center gap-4 rounded-2xl border border-filet bg-ivoire p-4 shadow-xl shadow-nuit/10">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sable text-or-fonce">
            <IconCheck />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-douce">Ajouté à votre commande</p>
            <p className="truncate font-serif text-lg leading-tight">{cart.toast}</p>
          </div>
          <button type="button" onClick={cart.open} className="lien-souligne shrink-0 text-or-fonce">
            Voir
          </button>
        </div>
      )}
    </div>
  );
}
