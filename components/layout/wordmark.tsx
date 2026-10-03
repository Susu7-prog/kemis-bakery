import Link from "next/link";
import { siteConfig } from "@/lib/config/site";
import { cn } from "@/lib/utils";

/** "Kemi's" is the mark; the full descriptor appears beside it from the sm breakpoint. */
export function Wordmark({ inverted = false, onClick }: { inverted?: boolean; onClick?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label={`${siteConfig.fullName}, home`}
      className="inline-flex flex-col leading-none"
    >
      <span className={cn("font-display text-[1.75rem] font-bold tracking-tight", inverted ? "text-paper" : "text-accent")}>
        Kemi&rsquo;s
      </span>
      <span className={cn("mt-1 hidden text-[0.6875rem] tracking-wide sm:block", inverted ? "text-paper/70" : "text-muted")}>
        Artisanal African Bakery &amp; Spice Shop
      </span>
    </Link>
  );
}
