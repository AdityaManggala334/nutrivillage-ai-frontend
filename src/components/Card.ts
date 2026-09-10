import { cva, type VariantProps } from 'class-variance-authority';
import { cn, escapeHtml } from './utils';

export const cardVariants = cva('rounded-card bg-white', {
  variants: {
    variant: {
      elevated: 'shadow-card',
      outline: 'ring-1 ring-stone-200 ring-inset',
      flat: 'bg-stone-50 ring-1 ring-stone-200 ring-inset',
    },
    padding: {
      none: 'p-0',
      sm: 'p-3',
      md: 'p-5',
      lg: 'p-6 sm:p-8',
    },
  },
  defaultVariants: {
    variant: 'elevated',
    padding: 'md',
  },
});

export type CardVariants = VariantProps<typeof cardVariants>;

export interface CardProps extends CardVariants {
  readonly title?: string;
  readonly description?: string;
  readonly content: string;
  readonly footer?: string;
  readonly className?: string;
  readonly id?: string;
  readonly ariaLabelledby?: string;
}

/** Merender kartu headless dengan header/body/footer opsional. */
export const renderCard = (props: CardProps): string => {
  const {
    title,
    description,
    content,
    footer,
    className,
    id,
    ariaLabelledby,
    variant = 'elevated',
    padding = 'md',
  } = props;

  const classes = cn(cardVariants({ variant, padding }), className);
  const attrs: string[] = [`class="${classes}"`];
  if (id) attrs.push(`id="${escapeHtml(id)}"`);
  if (ariaLabelledby) attrs.push(`aria-labelledby="${escapeHtml(ariaLabelledby)}"`);

  const header =
    title || description
      ? `<header class="mb-4">
          ${title ? `<h3 class="text-lg font-bold text-stone-900">${escapeHtml(title)}</h3>` : ''}
          ${description ? `<p class="mt-1 text-sm text-stone-500">${escapeHtml(description)}</p>` : ''}
        </header>`
      : '';

  const footerHtml = footer
    ? `<footer class="mt-5 border-t border-stone-100 pt-4">${footer}</footer>`
    : '';

  return `<article ${attrs.join(' ')}>${header}${content}${footerHtml}</article>`;
};
