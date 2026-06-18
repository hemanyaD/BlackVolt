import type { MetadataRoute } from "next";
import { brand } from "@/lib/theme";
import { getAllProducts } from "@/data/products";

/**
 * Site map covering static routes plus one entry per product. Update `brand.url`
 * in src/lib/theme.ts to the production domain before launch.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const base = brand.url;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: `${base}/shop`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${base}/story`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${base}/contact`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];

  const productRoutes: MetadataRoute.Sitemap = getAllProducts().map((p) => ({
    url: `${base}/shop/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}
