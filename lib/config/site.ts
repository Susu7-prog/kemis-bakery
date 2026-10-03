export const siteConfig = {
  name: "Kemi's",
  fullName: "Kemi's Artisanal African Bakery & Spice Shop",
  tagline: "African bakes and spices, made in small batches",
  description:
    "Kemi's is an artisanal African bakery and spice shop. Breads, pastries and cakes baked in small batches, plus spice blends made from ingredients we can name.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  currency: "NGN",
  locale: "en-NG",
} as const;

export const mainNav = [
  { label: "Shop", href: "/shop" },
  { label: "Collections", href: "/collections" },
  { label: "About", href: "/about" },
] as const;
