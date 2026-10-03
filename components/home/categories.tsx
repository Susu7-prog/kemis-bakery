import Link from "next/link";
import { Container } from "@/components/layout/container";

type Category = { name: string; blurb: string; href: string; shape: React.ReactNode };

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.5 } as const;

const categories: Category[] = [
  {
    name: "Lighting",
    blurb: "Table, floor and wall lights with replaceable parts.",
    href: "/shop?category=lighting",
    shape: (
      <svg viewBox="0 0 120 120" className="size-full" aria-hidden="true">
        <circle cx="60" cy="46" r="26" {...stroke} />
        <path d="M60 72v32M42 104h36" {...stroke} />
      </svg>
    ),
  },
  {
    name: "Ceramics",
    blurb: "Hand-thrown vessels, glazed and fired in small batches.",
    href: "/shop?category=ceramics",
    shape: (
      <svg viewBox="0 0 120 120" className="size-full" aria-hidden="true">
        <path d="M44 24h32c0 14 18 20 18 44a34 34 0 0 1-68 0c0-24 18-30 18-44Z" {...stroke} />
      </svg>
    ),
  },
  {
    name: "Desk",
    blurb: "Tools for focused work, built from metal, wood and leather.",
    href: "/shop?category=desk",
    shape: (
      <svg viewBox="0 0 120 120" className="size-full" aria-hidden="true">
        <rect x="18" y="62" width="84" height="8" {...stroke} />
        <path d="M30 70v32M90 70v32M44 62V36h32v26" {...stroke} />
      </svg>
    ),
  },
  {
    name: "Textiles",
    blurb: "Linen, wool and cotton, woven to wear in rather than out.",
    href: "/shop?category=textiles",
    shape: (
      <svg viewBox="0 0 120 120" className="size-full" aria-hidden="true">
        <path d="M20 30h80M20 50h80M20 70h80M20 90h80M36 22v76M60 22v76M84 22v76" {...stroke} />
      </svg>
    ),
  },
];

export function Categories() {
  return (
    <section aria-labelledby="categories-title" className="border-t border-line py-20 sm:py-28">
      <Container>
        <h2 id="categories-title" className="max-w-2xl text-headline">
          Four ways into the range.
        </h2>
        <ul className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <li key={c.name} className="bg-paper">
              <Link
                href={c.href}
                className="group flex h-full flex-col gap-6 p-6 transition-colors duration-200 hover:bg-surface sm:p-8"
              >
                <span className="block size-24 text-ink transition-colors duration-200 group-hover:text-accent">
                  {c.shape}
                </span>
                <span className="mt-auto">
                  <span className="block font-display text-title">{c.name}</span>
                  <span className="mt-2 block text-muted">{c.blurb}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
