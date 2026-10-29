# Dame de Bijoux World : site vitrine

Site de la boutique Dame de Bijoux World (Lomé) : catalogue, fiches produits et commande envoyée toute prête sur WhatsApp. Pas de paiement en ligne, pas de base de données.

**Technologies :** Next.js 16 (App Router, Cache Components), React 19, Tailwind CSS 4, TypeScript, Vercel Analytics. Hébergement prévu sur Vercel.

## Lancer en local

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:3000.

## Modifier le contenu (sans toucher au design)

| Je veux… | Fichier |
|---|---|
| Changer le téléphone, WhatsApp, l'adresse, TikTok, les textes paiement/livraison | `src/lib/site.ts` |
| Ajouter, retirer ou modifier un produit, un prix, un coloris | `src/lib/products.ts` |
| Modifier les questions de la FAQ | `src/lib/faq.ts` |
| Ajouter des photos | les déposer dans `public/produits/`, puis les référencer dans `products.ts` |

**Ajouter un produit :** copier un bloc existant dans `products.ts`, changer `slug` (adresse de la page, sans accents ni espaces), `name`, `category`, `price`, `images`. Le produit apparaît automatiquement dans la Sélection, le sitemap et les suggestions.

**Catégorie « sur demande » → en ligne :** dès qu'un produit est ajouté dans une catégorie (bagues, boucles…), retirer `onRequest: true` de cette catégorie.

## Pages

| Adresse | Contenu |
|---|---|
| `/` | Accueil : héros, catégories, sélection, étapes de commande, vente en gros, Maison, TikTok, FAQ, contact |
| `/selection` | Catalogue avec filtres par catégorie et tri par prix |
| `/selection/[produit]` | Fiche produit : galerie, coloris, quantité, ajout à la commande, commande WhatsApp directe |
| `/grossistes` | Vente en gros : profils, étapes, formulaire de demande de tarifs → WhatsApp |
| `/maison`, `/tiktok`, `/faq`, `/contact`, `/mentions-legales` | Pages d'information |

Le panier est gardé dans le navigateur de la cliente (`localStorage`). À l'envoi, le message WhatsApp contient les articles, les coloris, le total indicatif, le nom et le mode de réception.

## Référencement

Le site génère automatiquement `sitemap.xml`, `robots.txt`, l'image de partage (`/opengraph-image`) et les données structurées Google (boutique, produits, FAQ, fil d'Ariane).

Une fois en ligne avec un nom de domaine, définir la variable `NEXT_PUBLIC_SITE_URL` (ex. `https://www.damedebijoux.com`) dans Vercel.

## Déployer sur Vercel

1. Pousser ce dossier sur un dépôt GitHub.
2. Sur vercel.com : *Add New → Project*, importer le dépôt (framework détecté automatiquement).
3. Dans *Analytics*, activer Web Analytics pour la mesure d'audience.

## Avant la mise en ligne : à confirmer avec la boutique

- [ ] Textes paiement et livraison (`site.ts`, champs `payment` et `delivery`)
- [ ] Nom du produit « Jonc Vis & Clou » (anciennement « Bracelet type Cartier », renommé pour éviter d'utiliser une marque déposée)
- [ ] Adresse de l'hébergeur dans les mentions légales
- [ ] Photos supplémentaires pour les catégories « sur demande »
