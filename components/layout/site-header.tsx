import Link from "next/link";
import { mainNav } from "@/lib/config/site";
import { Container } from "./container";
import { Wordmark } from "./wordmark";
import { HeaderActions } from "./header-actions";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper">
      <Container className="flex h-(--header-height) items-center justify-between gap-6">
        <Wordmark />
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-9">
            {mainNav.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="font-medium underline-offset-8 decoration-2 decoration-accent hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <HeaderActions />
      </Container>
    </header>
  );
}
