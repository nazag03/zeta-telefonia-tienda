import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/format";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    db.products.where((p) => p.active),
    db.categories.where((c) => c.active),
  ]);
  const staticPages = ["", "/catalogo", "/promociones", "/nosotros", "/contacto"].map((p) => ({
    url: siteUrl(p),
    changeFrequency: "daily" as const,
    priority: p === "" ? 1 : 0.8,
  }));
  return [
    ...staticPages,
    ...categories.map((c) => ({ url: siteUrl(`/catalogo/${c.slug}`), lastModified: c.updatedAt, priority: 0.7 })),
    ...products.map((p) => ({ url: siteUrl(`/producto/${p.slug}`), lastModified: p.updatedAt, priority: 0.6 })),
  ];
}
