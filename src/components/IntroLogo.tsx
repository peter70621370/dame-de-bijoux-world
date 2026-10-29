"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

// Reprise de l'intro de l'ancien site : logo doré plein écran à chaque chargement,
// puis fondu avec léger zoom dès que la page est prête.
const MIN_MS = 300;
const MAX_MS = 8000;
const FADE_MS = 600;

export function IntroLogo() {
  const [phase, setPhase] = useState<"visible" | "leaving" | "gone">("visible");

  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("intro-en-cours");
    const timers: number[] = [];
    let loaded = document.readyState === "complete";
    let minElapsed = false;
    let left = false;

    const leave = () => {
      if (left) return;
      left = true;
      html.classList.remove("intro-en-cours");
      setPhase("leaving");
      timers.push(window.setTimeout(() => setPhase("gone"), FADE_MS + 100));
    };
    const check = () => loaded && minElapsed && leave();
    const onLoad = () => {
      loaded = true;
      check();
    };

    window.addEventListener("load", onLoad);
    timers.push(
      window.setTimeout(() => {
        minElapsed = true;
        check();
      }, MIN_MS),
    );
    timers.push(window.setTimeout(leave, MAX_MS));
    return () => {
      window.removeEventListener("load", onLoad);
      timers.forEach(clearTimeout);
      html.classList.remove("intro-en-cours");
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      role="status"
      aria-label="Chargement — Dame de Bijoux World"
      className={`animate-intro-secours fixed inset-0 z-[9999] grid place-items-center bg-[#0b060a] transition-[opacity,scale] duration-600 ease-[cubic-bezier(.65,0,.35,1)] ${
        phase === "leaving" ? "pointer-events-none scale-[1.04] opacity-0" : ""
      }`}
    >
      <Image
        src="/marque/logo-intro.webp"
        alt=""
        width={1080}
        height={1080}
        preload
        sizes="min(72vmin, 560px)"
        className="block h-auto w-[min(72vmin,560px)]"
      />
    </div>
  );
}
