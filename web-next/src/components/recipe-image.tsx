import { cn } from "@/lib/utils";

interface ImageTheme {
  readonly from: string;
  readonly to: string;
  readonly emoji: string;
}

const IMAGE_THEMES: Readonly<Record<string, ImageTheme>> = {
  pecel: { from: "from-brand-400", to: "to-brand-700", emoji: "🥗" },
  lodeh: { from: "from-emerald-400", to: "to-teal-700", emoji: "🍲" },
  oseng: { from: "from-lime-400", to: "to-green-700", emoji: "🥬" },
  sup: { from: "from-amber-300", to: "to-orange-600", emoji: "🍜" },
  "tahu-telur": { from: "from-yellow-300", to: "to-amber-600", emoji: "🍳" },
  pepes: { from: "from-teal-300", to: "to-cyan-700", emoji: "🐟" },
  urap: { from: "from-green-300", to: "to-emerald-700", emoji: "🌽" },
  buntil: { from: "from-lime-300", to: "to-green-800", emoji: "🍃" },
};

const FALLBACK: ImageTheme = { from: "from-stone-300", to: "to-stone-600", emoji: "🍽️" };

export interface RecipeImageProps {
  readonly imageKey: string;
  readonly alt: string;
  readonly className?: string;
  readonly priority?: boolean;
}

/**
 * Placeholder foto menu berbasis gradien (tanpa aset eksternal, LCP cepat).
 * RSC: tidak ada interaktivitas, tetap di server.
 */
export function RecipeImage({ imageKey, alt, className, priority = false }: RecipeImageProps) {
  const theme = IMAGE_THEMES[imageKey] ?? FALLBACK;

  return (
    <div
      role="img"
      aria-label={alt}
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br",
        theme.from,
        theme.to,
        className,
      )}
    >
      <span className="text-5xl drop-shadow-sm" aria-hidden="true">
        {theme.emoji}
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_55%)]"
      />
      {priority ? (
        <span className="sr-only">{alt}</span>
      ) : null}
    </div>
  );
}
