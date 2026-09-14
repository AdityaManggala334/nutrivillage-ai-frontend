import type { ReactNode } from "react";

export interface SectionHeadingProps {
  readonly eyebrow?: string;
  readonly title: string;
  readonly description?: string;
  readonly action?: ReactNode;
}

/** Heading seksi konsisten (RSC). */
export function SectionHeading({ eyebrow, title, description, action }: SectionHeadingProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow ? (
          <p className="text-xs font-semibold tracking-wide text-brand-600 uppercase dark:text-brand-400">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-50">{title}</h2>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-stone-500 dark:text-stone-400">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
