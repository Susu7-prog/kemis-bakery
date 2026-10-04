import Link from "next/link";
import { signOutAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

const links = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "Orders" },
] as const;

export function AccountNav({ current }: { current: "overview" | "orders" }) {
  return (
    <nav aria-label="Account" className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
      <ul className="flex gap-6">
        {links.map((link) => {
          const active = (link.href === "/account") === (current === "overview");
          return (
            <li key={link.href}>
              <Link href={link.href} aria-current={active ? "page" : undefined}
                className={cn("font-medium underline-offset-8 decoration-2 decoration-accent", active ? "underline" : "text-muted hover:text-ink")}>
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <form action={signOutAction}>
        <button type="submit" className="text-caption underline underline-offset-4 decoration-line-strong hover:decoration-ink">Sign out</button>
      </form>
    </nav>
  );
}
