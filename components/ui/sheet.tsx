"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  label: string;
  className?: string;
  children: React.ReactNode;
};

/**
 * Modal surface built on the native <dialog> element, which gives us focus
 * trapping, Escape-to-close and an inert background without extra code.
 * Clicking the backdrop closes it. Page scroll is locked while open.
 */
export function Sheet({ open, onClose, label, className, children }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className={cn("m-0 max-h-none max-w-none bg-paper p-0 text-ink backdrop:bg-ink/45", className)}
    >
      {children}
    </dialog>
  );
}
