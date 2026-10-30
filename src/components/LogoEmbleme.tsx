import type { ImgHTMLAttributes } from "react";

// Logo de la boutique en pastille ronde (fond noir, or), tiré de docs/logo/client/logo-client-1080.png.
// La taille vient de la classe (`h-10 w-auto`…) ; l'image fait 256 px, assez pour 128 px affichés en écran Retina.
export function LogoEmbleme(props: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/marque/logo-rond.webp" alt="" width={256} height={256} decoding="async" {...props} />
  );
}
