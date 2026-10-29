import type { MetadataRoute } from "next";
import { products } from "@/lib/products";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/selection", "/grossistes", "/maison", "/faq", "/contact", "/tiktok"];
  return [
    ...pages.map((path) => ({
      url: `${site.url}${path}`,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : path === "/selection" ? 0.9 : 0.6,
    })),
    ...products.map((p) => ({
      url: `${site.url}/selection/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: p.images.map((i) => `${site.url}${i.src}`),
    })),
  ];
}
