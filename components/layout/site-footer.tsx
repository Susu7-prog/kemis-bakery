import Link from "next/link";
import { siteConfig } from "@/lib/config/site";
import { categories } from "@/lib/data/categories";
import { Container } from "./container";
import { Wordmark } from "./wordmark";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-paper">
      <Container className="grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <Wordmark inverted />
          <p className="max-w-xs text-paper/70">{siteConfig.tagline}.</p>
        </div>
        <nav aria-label="Shop categories">
          <h2 className="font-display text-lead">Shop</h2>
          <ul className="mt-4 space-y-2 text-paper/75">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/shop?category=${c.slug}`} className="hover:text-paper hover:underline underline-offset-4">{c.name}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Kemi's">
          <h2 className="font-display text-lead">Kemi&rsquo;s</h2>
          <ul className="mt-4 space-y-2 text-paper/75">
            <li><Link href="/about" className="hover:text-paper hover:underline underline-offset-4">About</Link></li>
            <li><Link href="/collections" className="hover:text-paper hover:underline underline-offset-4">Collections</Link></li>
          </ul>
        </nav>
        <nav aria-label="Account">
          <h2 className="font-display text-lead">Account</h2>
          <ul className="mt-4 space-y-2 text-paper/75">
            <li><Link href="/account" className="hover:text-paper hover:underline underline-offset-4">Your account</Link></li>
            <li><Link href="/account/orders" className="hover:text-paper hover:underline underline-offset-4">Order history</Link></li>
          </ul>
        </nav>
      </Container>
      <div className="border-t border-paper/15">
        <Container className="flex flex-col gap-2 py-6 text-caption text-paper/65 sm:flex-row sm:justify-between">
          <p>&copy; {new Date().getFullYear()} {siteConfig.fullName}. All rights reserved.</p>
          <p>Prices are in Nigerian naira (&#8358;).</p>
        </Container>
      </div>
    </footer>
  );
}
