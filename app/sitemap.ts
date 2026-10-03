import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config/site";
import { getAllSlugs } from "@/lib/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const pages = ["", "/shop", "/collections", "/about"].map((path) => ({ url: `${base}${path}` }));
  const products = (await getAllSlugs()).map((slug) => ({ url: `${base}/products/${slug}` }));
  return [...pages, ...products];
}
