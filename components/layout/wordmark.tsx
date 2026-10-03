import Link from "next/link";

export function Wordmark() {
  return (
    <Link
      href="/"
      aria-label="NOVA home"
      className="inline-flex items-center gap-2 font-display text-2xl font-bold tracking-tight"
    >
      <span aria-hidden="true" className="size-3 rounded-full bg-accent" />
      NOVA
    </Link>
  );
}
