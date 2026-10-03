export const siteConfig = {
  name: "NOVA",
  tagline: "Everyday objects, made to last decades",
  description:
    "NOVA designs lighting, ceramics, desk pieces and textiles in small runs and sells them directly, with every material and maker listed.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  currency: "NGN",
  locale: "en-NG",
} as const;
