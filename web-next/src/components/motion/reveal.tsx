"use client";

import type { ReactNode } from "react";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

export type RevealDirection = "up" | "left" | "right" | "scale" | "none";

export interface RevealProps {
  readonly children: ReactNode;
  readonly className?: string;
  /** Jeda animasi dalam milidetik, dipakai untuk efek bertingkat (stagger). */
  readonly delay?: number;
  readonly direction?: RevealDirection;
  readonly once?: boolean;
}

/**
 * Pembungkus scroll-reveal berbasis IntersectionObserver + CSS transition.
 * Anak tetap dirender di server; hanya penambahan class yang terjadi di klien.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  direction = "up",
  once = true,
}: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ once });

  return (
    <div
      ref={ref}
      data-direction={direction}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn("reveal", inView && "is-visible", className)}
    >
      {children}
    </div>
  );
}
