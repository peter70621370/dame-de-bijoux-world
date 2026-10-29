/** « Bracelet Trèfle & Cœur » → « bracelet-trefle-coeur » : identifiant lisible pour les adresses. */
export function slugify(texte: string) {
  return texte
    .replace(/[œŒ]/g, "oe")
    .replace(/[æÆ]/g, "ae")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}

/** Premier identifiant libre : « bague », puis « bague-2 », « bague-3 »… */
export async function slugLibre(base: string, existe: (slug: string) => Promise<boolean>) {
  for (let n = 1; ; n++) {
    const slug = n === 1 ? base : `${base}-${n}`;
    if (!(await existe(slug))) return slug;
  }
}
