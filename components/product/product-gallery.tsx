"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/** Main image plus thumbnails. Thumbnails are real buttons, so the gallery works by keyboard. */
export function ProductGallery({ name, images }: { name: string; images: string[] }) {
  const [index, setIndex] = useState(0);
  const current = images[Math.min(index, images.length - 1)];

  return (
    <div className="space-y-3">
      <div className="relative aspect-4/5 overflow-hidden rounded-md bg-surface">
        <Image
          key={current}
          src={current}
          alt={index === 0 ? name : `${name}, close-up view`}
          fill
          priority
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="object-cover"
        />
      </div>
      {images.length > 1 && (
        <ul className="grid grid-cols-4 gap-3" aria-label={`${name} images`}>
          {images.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show image ${i + 1} of ${images.length}`}
                aria-pressed={i === index}
                className={cn(
                  "relative block aspect-square w-full overflow-hidden rounded-md border-2 bg-surface transition-colors",
                  i === index ? "border-ink" : "border-transparent hover:border-line-strong",
                )}
              >
                <Image src={src} alt="" fill sizes="120px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
