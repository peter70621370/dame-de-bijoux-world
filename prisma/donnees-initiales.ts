// Contenu du catalogue tel qu'il était codé dans le site avant le back-office.
// Sert uniquement à remplir une base vide (voir seed.ts) ; ensuite tout se gère dans /admin.

type CategorieInitiale = {
  slug: string;
  label: string;
  tag: string;
  blurb: string;
  onRequest?: boolean;
  image?: string;
};

type ProduitInitial = {
  slug: string;
  name: string;
  category: string;
  price: number;
  isNew?: boolean;
  short: string;
  description: string;
  details: string[];
  images: { src: string; alt: string }[];
  option?: {
    name: string;
    plural: string;
    choose: string;
    /** `image` : position de la photo à montrer (0 = première). */
    values: { label: string; image?: number }[];
  };
};

export const categoriesInitiales: CategorieInitiale[] = [
  {
    slug: "bracelets",
    label: "Bracelets",
    tag: "Bracelet",
    blurb: "Joncs, chaînes fines et motifs porte-bonheur.",
    image: "/produits/bracelet-trefle-coloris.jpg",
  },
  {
    slug: "ceintures",
    label: "Ceintures & chaînes de taille",
    tag: "Ceinture",
    blurb: "La touche dorée qui transforme une tenue.",
    image: "/produits/ceinture-papillons-or.jpg",
  },
  // Photos libres de Wikimedia Commons, en attendant celles de la boutique (crédits : /mentions-legales).
  {
    slug: "colliers",
    label: "Colliers & sautoirs",
    tag: "Collier",
    blurb: "Pièces dorées aux lignes fines, pour toutes les occasions.",
    onRequest: true,
    image: "/categories/colliers.jpg",
  },
  {
    slug: "bagues",
    label: "Bagues",
    tag: "Bague",
    blurb: "Pierres brillantes et finitions soignées, seules ou empilées.",
    onRequest: true,
    image: "/categories/bagues.jpg",
  },
  {
    slug: "boucles",
    label: "Boucles d’oreilles",
    tag: "Boucles",
    blurb: "Créoles, pendantes ou puces : l’accent lumineux de votre allure.",
    onRequest: true,
    image: "/categories/boucles.jpg",
  },
  {
    slug: "parures",
    label: "Parures & beauté",
    tag: "Parure",
    blurb: "Coffrets assortis, barrettes, headbands et essentiels.",
    onRequest: true,
    image: "/categories/parures.jpg",
  },
];

export const produitsInitiaux: ProduitInitial[] = [
  {
    slug: "chaine-de-taille-coquillages-etoiles",
    name: "Chaîne de taille Coquillages & Étoiles",
    category: "ceintures",
    price: 2500,
    isNew: true,
    short: "Double rang doré : coquilles Saint-Jacques et étoiles de mer.",
    description:
      "Un double rang doré qui marie coquilles Saint-Jacques et étoiles de mer, pour une allure solaire. À porter sur une robe fluide, une jupe en satin ou un jean taille haute.",
    details: ["Double rang", "Finition dorée", "Chaîne ajustable"],
    images: [
      {
        src: "/produits/chaine-coquillages-etoiles.jpg",
        alt: "Chaîne de taille dorée à coquillages et étoiles de mer portée sur une jupe en satin ivoire",
      },
    ],
  },
  {
    slug: "ceinture-papillons-turquoise",
    name: "Ceinture Papillons Turquoise",
    category: "ceintures",
    price: 2500,
    isNew: true,
    short: "Papillons ciselés sertis d’une pierre turquoise.",
    description:
      "Des papillons ciselés, chacun serti d’une pierre turquoise, reliés par une chaîne ajustable. Disponible en finition dorée ou argentée.",
    details: ["Pierres couleur turquoise", "Chaîne ajustable avec pampille", "Deux finitions"],
    images: [
      {
        src: "/produits/ceinture-papillons-or.jpg",
        alt: "Ceinture à papillons dorés sertis de pierres turquoise",
      },
      {
        src: "/produits/ceinture-papillons-argent.jpg",
        alt: "Ceinture à papillons argentés sertis de pierres turquoise portée sur une jupe plissée noire",
      },
    ],
    option: {
      name: "Finition",
      plural: "finitions",
      choose: "Choisir la finition",
      values: [
        { label: "Dorée", image: 0 },
        { label: "Argentée", image: 1 },
      ],
    },
  },
  {
    slug: "bracelet-trefle",
    name: "Bracelet Trèfle",
    category: "bracelets",
    price: 1000,
    short: "Cinq trèfles perlés sur une chaîne fine.",
    description:
      "Cinq trèfles au contour perlé, montés sur une chaîne fine avec fermoir ajustable. Le porte-bonheur du quotidien, en cinq coloris à assortir ou à superposer.",
    details: ["Cinq motifs trèfle", "Fermoir ajustable", "Cinq coloris"],
    images: [
      {
        src: "/produits/bracelet-trefle-dore.jpg",
        alt: "Trois bracelets trèfle : nacre et doré, noir et doré, tout doré",
      },
      {
        src: "/produits/bracelet-trefle-coloris.jpg",
        alt: "Les cinq coloris du bracelet trèfle présentés sur un plateau en velours gris",
      },
    ],
    option: {
      name: "Coloris",
      plural: "coloris",
      choose: "Choisir le coloris",
      values: [
        { label: "Nacre & doré", image: 0 },
        { label: "Noir & doré", image: 0 },
        { label: "Tout doré", image: 0 },
        { label: "Nacre & argenté", image: 1 },
        { label: "Noir & argenté", image: 1 },
      ],
    },
  },
  {
    // Ancien nom : « Bracelet type Cartier ». Nom de marque retiré (risque juridique).
    slug: "jonc-vis-clou",
    name: "Jonc Vis & Clou",
    category: "bracelets",
    price: 1500,
    short: "Jonc doré poli, motif vis ou clou.",
    description:
      "Un jonc doré au poli miroir, au choix : motif vis gravé ou clou enroulé. Seul pour une touche nette, ou les deux ensemble pour une accumulation.",
    details: ["Finition dorée polie", "Deux modèles", "Se porte seul ou en accumulation"],
    images: [
      {
        src: "/produits/bracelet-jonc-vis-clou.jpg",
        alt: "Deux joncs dorés, l’un à motif vis, l’autre en forme de clou, posés sur un présentoir en velours",
      },
    ],
    option: {
      name: "Modèle",
      plural: "modèles",
      choose: "Choisir le modèle",
      values: [{ label: "Jonc à vis" }, { label: "Jonc clou" }],
    },
  },
];
