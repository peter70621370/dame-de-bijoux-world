import { site } from "./site";

export type FaqItem = { q: string; a: string };
export type FaqGroup = { title: string; items: FaqItem[] };

export const faq: FaqGroup[] = [
  {
    title: "Commander",
    items: [
      {
        q: "Comment passer commande ?",
        a: "Dans la Sélection, choisissez vos articles et leur coloris, ajoutez-les à votre commande, puis indiquez votre nom et votre mode de réception. Votre commande s’ouvre toute prête dans WhatsApp : il ne reste qu’à l’envoyer. Vous pouvez aussi nous appeler au " +
          site.phone +
          ".",
      },
      {
        q: "Vendez-vous en gros et au détail ?",
        a: "Oui. Nous sommes spécialisés dans la vente en gros à petits prix, et nous servons aussi les particuliers à l’unité. Pour les quantités et les tarifs de gros, faites une demande depuis la page Vente en gros : nous vous répondons sur WhatsApp.",
      },
      {
        q: "Où voir les nouveautés ?",
        a: `Les arrivages sont présentés régulièrement sur notre compte TikTok ${site.tiktokHandle} et dans la Sélection de ce site. Les articles qui ne sont pas encore en ligne se commandent sur demande.`,
      },
    ],
  },
  {
    title: "Paiement & livraison",
    items: [
      { q: "Quels sont les modes de paiement ?", a: site.payment },
      { q: "Livrez-vous ?", a: site.delivery },
      {
        q: "Où se trouve la boutique ?",
        a: `${site.address}, ${site.city} — ${site.country}. Ouverte ${site.hours.toLowerCase()}. Pour un retrait, prévenez-nous sur WhatsApp afin que votre commande soit prête.`,
      },
    ],
  },
  {
    title: "Nos bijoux",
    items: [
      {
        q: "Les bijoux sont-ils de bonne qualité ?",
        a: "Chaque pièce est choisie pour son éclat, sa tenue et sa finition. Nous vous montrons volontiers une photo ou une vidéo de l’article sur WhatsApp avant votre commande.",
      },
      {
        q: "Comment entretenir mes bijoux ?",
        a: "Évitez l’eau, les parfums, les crèmes et les frottements. Retirez vos bijoux pour dormir ou faire du sport, essuyez-les avec un chiffon doux et rangez-les séparément, à l’abri de l’humidité.",
      },
    ],
  },
];
