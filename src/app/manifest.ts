import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.shortName,
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#fbf7f1",
    theme_color: "#150b11",
    lang: "fr",
    icons: [
      { src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { src: "/marque/icone-192.png", sizes: "192x192", type: "image/png" },
      { src: "/marque/icone-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
