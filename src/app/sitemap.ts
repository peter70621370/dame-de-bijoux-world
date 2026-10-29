import type { MetadataRoute } from "next";
import { getCatalogue } from "@/lib/data/catalogue";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products } = await getCatalogue();
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
      images: p.images.map((i) => new URL(i.src, site.url).href),
    })),
  ];
}
