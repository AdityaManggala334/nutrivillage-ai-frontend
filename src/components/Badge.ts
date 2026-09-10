import { cva, type VariantProps } from 'class-variance-authority';
import { cn, escapeHtml } from './utils';

export const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full font-semibold whitespace-nowrap',
  {
    variants: {
      tone: {
        brand: 'bg-brand-100 text-brand-800',
        harvest: 'bg-harvest-100 text-harvest-800',
        neutral: 'bg-stone-100 text-stone-700',
        danger: 'bg-red-100 text-red-700',
        info: 'bg-sky-100 text-sky-700',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
      },
    },
    defaultVariants: {
      tone: 'brand',
      size: 'sm',
    },
  },
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;

export interface BadgeProps extends BadgeVariants {
  readonly label: string;
  readonly className?: string;
}

/** Merender badge headless sebagai string HTML. */
export const renderBadge = (props: BadgeProps): string => {
  const { label, tone = 'brand', size = 'sm', className } = props;
  const classes = cn(badgeVariants({ tone, size }), className);
  return `<span class="${classes}">${escapeHtml(label)}</span>`;
};
