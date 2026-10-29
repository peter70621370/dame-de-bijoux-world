import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // forbidden() : page « Accès réservé » quand un utilisateur simple ouvre une rubrique d'administrateur.
    authInterrupts: true,
    // Photos du back-office : réduites dans le navigateur avant l'envoi, 5 Mo au plus si ce n'est pas possible.
    serverActions: { bodySizeLimit: "6mb" },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
