/**
 * Réduit une photo à 1 600 px de côté au plus, en JPEG : quelques centaines de Ko au lieu de plusieurs Mo,
 * plus rapide à envoyer avec une connexion mobile et à afficher sur le site.
 */
export async function reduirePhoto(fichier: File, cote = 1600): Promise<Blob> {
  const image = await createImageBitmap(fichier, { imageOrientation: "from-image" });
  const echelle = Math.min(1, cote / Math.max(image.width, image.height));
  const toile = document.createElement("canvas");
  toile.width = Math.round(image.width * echelle);
  toile.height = Math.round(image.height * echelle);

  const contexte = toile.getContext("2d");
  if (!contexte) throw new Error("Dessin impossible dans ce navigateur");
  // Les zones transparentes (PNG) deviendraient noires en JPEG : fond blanc d'abord.
  contexte.fillStyle = "#fff";
  contexte.fillRect(0, 0, toile.width, toile.height);
  contexte.drawImage(image, 0, 0, toile.width, toile.height);
  image.close();

  return new Promise((resoudre, rejeter) =>
    toile.toBlob((blob) => (blob ? resoudre(blob) : rejeter(new Error("Encodage impossible"))), "image/jpeg", 0.85),
  );
}
