"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useActionState, useState } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { IconSparkle } from "@/components/icons";
import { connexion, type ConnexionState } from "@/lib/actions/auth";

// Étincelles autour du logo : elles s'allument et s'éteignent quand on touche le logo.
const ETINCELLES = [
  { left: "6%", top: "20%", size: 18, delay: "0s" },
  { left: "80%", top: "6%", size: 13, delay: "0.9s" },
  { left: "88%", top: "64%", size: 20, delay: "1.7s" },
  { left: "14%", top: "80%", size: 12, delay: "2.3s" },
  { left: "48%", top: "-6%", size: 10, delay: "1.2s" },
];

const champ =
  "block h-12 w-full rounded-xl border border-ivoire/15 bg-white/[0.06] px-4 text-base text-ivoire outline-none transition-colors placeholder:text-ivoire/35 focus:border-or focus:bg-white/[0.09] autofill:shadow-[inset_0_0_0_1000px_#22131b] autofill:[-webkit-text-fill-color:#fbf7f1]";

export function LoginForm() {
  const [state, action, pending] = useActionState<ConnexionState, FormData>(connexion, undefined);
  const [eclat, setEclat] = useState(true);
  const [voir, setVoir] = useState(false);

  return (
    <div className="grain relative isolate flex min-h-dvh flex-1 items-center justify-center overflow-hidden bg-nuit px-5 pt-20 pb-12 text-ivoire md:py-16">
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 -z-10 transition-opacity duration-1000 ${eclat ? "opacity-100" : "opacity-25"}`}
        style={{
          background:
            "radial-gradient(60% 55% at 28% 42%, rgb(201 162 94 / 0.2), transparent 65%), radial-gradient(50% 50% at 88% 100%, rgb(179 52 94 / 0.16), transparent 60%)",
        }}
      />

      <Link
        href="/"
        className="absolute top-5 left-5 inline-flex items-center gap-2 py-2 text-[0.68rem] font-medium uppercase tracking-[0.2em] text-ivoire/55 transition-colors hover:text-ivoire md:top-8 md:left-8"
      >
        <ArrowLeft size={14} aria-hidden /> Retour au site
      </Link>

      <div className="grid w-full max-w-[960px] items-center gap-8 md:grid-cols-[0.9fr_1fr] md:gap-14">
        <div className="flex flex-col items-center">
          <button
            type="button"
            aria-pressed={eclat}
            aria-label="Faire briller le logo"
            onClick={() => setEclat((v) => !v)}
            className="relative rounded-full focus-visible:outline-offset-8"
          >
            <span className="relative block size-40 md:size-80">
              <span
                aria-hidden
                className={`absolute inset-[18%] rounded-full bg-or/30 blur-3xl transition-opacity duration-1000 ${
                  eclat ? "opacity-100" : "opacity-0"
                }`}
              />
              {/* Fond noir de l'image fondu dans le décor : seul le logo doré ressort. */}
              <Image
                src="/marque/logo-intro.webp"
                alt=""
                fill
                priority
                sizes="(min-width:768px) 320px, 160px"
                className={`object-contain mix-blend-lighten transition-[filter,opacity] duration-1000 ${
                  eclat ? "opacity-100" : "opacity-50 grayscale-[40%]"
                }`}
              />
              {ETINCELLES.map((e) => (
                <IconSparkle
                  key={e.left}
                  width={e.size}
                  height={e.size}
                  fill="currentColor"
                  style={{ left: e.left, top: e.top, animationDelay: e.delay }}
                  className={`absolute text-or-clair transition-opacity duration-700 motion-safe:animate-scintille ${
                    eclat ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
            </span>
          </button>
          <p className="eyebrow mt-4 text-[0.62rem] text-ivoire/45">Touchez le logo</p>
        </div>

        <div
          className={`rounded-2xl border bg-nuit-2/70 p-6 backdrop-blur-xl transition-[border-color,box-shadow] duration-700 md:p-9 ${
            eclat
              ? "border-or/35 shadow-[0_30px_70px_-20px_rgb(0_0_0/0.7),0_0_90px_-25px_rgb(201_162_94/0.35)]"
              : "border-or/15 shadow-[0_30px_60px_-20px_rgb(0_0_0/0.6)]"
          }`}
        >
          <p className="eyebrow text-or-clair">Bienvenue</p>
          <h1 className="titre mt-3 text-[2.6rem] md:text-5xl">Espace boutique</h1>
          <p className="mt-3 text-sm leading-relaxed text-ivoire/60">
            Connectez-vous pour gérer les articles, les annonces et les informations du site.
          </p>

          <Suspense fallback={null}>
            <AvisSession />
          </Suspense>

          <form action={action} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="text-sm font-medium text-ivoire/85">
                Adresse e-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                required
                defaultValue={state?.email}
                aria-describedby={state?.error ? "erreur-connexion" : undefined}
                className={`${champ} mt-1.5`}
              />
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-medium text-ivoire/85">
                Mot de passe
              </label>
              <div className="relative mt-1.5">
                <input
                  id="password"
                  name="password"
                  type={voir ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  aria-describedby={state?.error ? "erreur-connexion" : undefined}
                  className={`${champ} pr-12 [&::-ms-reveal]:hidden`}
                />
                <button
                  type="button"
                  onClick={() => setVoir((v) => !v)}
                  aria-label={voir ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  className="absolute top-1/2 right-1.5 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-ivoire/55 transition-colors hover:text-ivoire"
                >
                  {voir ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
                </button>
              </div>
            </div>

            {state?.error && (
              <p
                id="erreur-connexion"
                role="alert"
                className="rounded-xl border border-rubis/45 bg-rubis/15 px-4 py-3 text-sm leading-relaxed text-ivoire"
              >
                {state.error}
              </p>
            )}

            <button type="submit" disabled={pending} className="bouton bouton-or w-full">
              {pending ? "Connexion…" : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/** Message affiché quand le serveur a refusé une session (compte supprimé, mot de passe changé…). */
function AvisSession() {
  const params = useSearchParams();
  if (params.get("session") !== "expiree") return null;
  return (
    <p className="mt-6 rounded-xl border border-or/30 bg-or/10 px-4 py-3 text-sm leading-relaxed text-ivoire/85">
      Votre session a pris fin : reconnectez-vous pour continuer.
    </p>
  );
}
