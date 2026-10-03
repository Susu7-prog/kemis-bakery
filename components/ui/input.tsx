import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  id: string;
  hint?: string;
  error?: string;
  hideLabel?: boolean;
};

/** Labelled text input. Label, hint and error are wired up for assistive tech. */
export function Field({ label, id, hint, error, hideLabel, className, ...props }: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={cn("text-caption font-medium", hideLabel && "sr-only")}>
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "h-12 w-full rounded-md border bg-surface px-4 text-body placeholder:text-muted",
          "transition-colors duration-200 hover:border-ink",
          error ? "border-danger" : "border-line-strong",
          className,
        )}
        {...props}
      />
      {hint && !error && <p id={hintId} className="text-caption text-muted">{hint}</p>}
      {error && <p id={errorId} role="alert" className="text-caption text-danger">{error}</p>}
    </div>
  );
}
