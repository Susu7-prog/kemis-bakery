import type { ButtonHTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "quiet";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap rounded-md transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-on-accent hover:bg-accent-strong disabled:hover:bg-accent",
  secondary: "border border-ink text-ink hover:bg-ink hover:text-paper disabled:hover:bg-transparent disabled:hover:text-ink",
  quiet: "text-ink underline underline-offset-4 decoration-line-strong hover:decoration-ink",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-body",
  lg: "h-14 px-7 text-lead",
};

type CommonProps = { variant?: Variant; size?: Size; className?: string };

export function buttonClasses({ variant = "primary", size = "md", className }: CommonProps = {}) {
  return cn(base, variants[variant], variant !== "quiet" && sizes[size], className);
}

export function Button({
  variant, size, className, type = "button", ...props
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={buttonClasses({ variant, size, className })} {...props} />;
}

export function ButtonLink({
  variant, size, className, href, children, onClick,
}: CommonProps & { href: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <Link href={href} onClick={onClick} className={buttonClasses({ variant, size, className })}>
      {children}
    </Link>
  );
}
