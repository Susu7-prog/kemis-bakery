import { cn } from "@/lib/utils";

type Tone = "turmeric" | "accent" | "neutral";

const tones: Record<Tone, string> = {
  turmeric: "bg-turmeric text-ink",
  accent: "bg-accent text-on-accent",
  neutral: "bg-surface text-ink border border-line-strong",
};

export function Badge({ tone = "turmeric", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span className={cn("inline-block rounded-sm px-2 py-0.5 text-caption font-medium", tones[tone])}>
      {children}
    </span>
  );
}
