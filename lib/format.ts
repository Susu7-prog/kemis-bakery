import { siteConfig } from "@/lib/config/site";

const priceFormatter = new Intl.NumberFormat(siteConfig.locale, {
  style: "currency",
  currency: siteConfig.currency,
  maximumFractionDigits: 0,
});

/** Formats whole naira, e.g. 4500 -> "₦4,500". */
export function formatPrice(naira: number): string {
  return priceFormatter.format(naira);
}
