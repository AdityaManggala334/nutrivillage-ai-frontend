import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface GlassShellProps {
  readonly children: ReactNode;
  readonly className?: string;
}

/**
 * Latar bergaya glassmorphism: mesh gradien brand yang bergerak halus dengan
 * blob blur. Dipakai pada halaman publik & auth agar permukaan kaca di atasnya
 * terlihat berlapis. Animasi mati otomatis pada prefers-reduced-motion.
 */
export function GlassShell({ children, className }: GlassShellProps) {
  return (
    <div className={cn("relative isolate overflow-hidden", className)}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="animate-mesh absolute -top-24 -left-16 h-80 w-80 rounded-full bg-brand-300/35 blur-3xl" />
        <div className="animate-mesh absolute top-1/3 -right-20 h-96 w-96 rounded-full bg-harvest-300/35 blur-3xl [animation-delay:-7s]" />
        <div className="animate-mesh absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-brand-400/20 blur-3xl [animation-delay:-12s]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/40 dark:to-stone-950/40" />
      </div>
      {children}
    </div>
  );
}
