import { cva, type VariantProps } from 'class-variance-authority';
import { cn, escapeHtml } from './utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors duration-150 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      intent: {
        primary: 'bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800',
        secondary:
          'bg-white text-brand-700 ring-1 ring-brand-200 ring-inset hover:bg-brand-50 active:bg-brand-100',
        ghost: 'text-stone-600 hover:bg-stone-100 hover:text-stone-900',
        harvest: 'bg-harvest-400 text-harvest-900 hover:bg-harvest-300 active:bg-harvest-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-5 text-sm',
        lg: 'h-12 px-6 text-base',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      intent: 'primary',
      size: 'md',
      fullWidth: false,
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

export interface ButtonProps extends ButtonVariants {
  readonly label: string;
  readonly type?: 'button' | 'submit' | 'reset';
  readonly action?: string;
  readonly ariaLabel?: string;
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly className?: string;
}

/** Merender tombol headless (variant dikelola CVA) sebagai string HTML. */
export const renderButton = (props: ButtonProps): string => {
  const {
    label,
    type = 'button',
    action,
    ariaLabel,
    disabled = false,
    loading = false,
    className,
    intent = 'primary',
    size = 'md',
    fullWidth = false,
  } = props;

  const isDisabled = disabled || loading;
  const classes = cn(buttonVariants({ intent, size, fullWidth }), className);

  const attributes: string[] = [
    `type="${type}"`,
    `class="${classes}"`,
    action ? `data-action="${escapeHtml(action)}"` : '',
    ariaLabel ? `aria-label="${escapeHtml(ariaLabel)}"` : '',
    isDisabled ? 'disabled aria-disabled="true"' : '',
    loading ? 'aria-busy="true"' : '',
  ];

  const content = loading
    ? `<span class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true"></span><span>${escapeHtml(label)}</span>`
    : escapeHtml(label);

  return `<button ${attributes.filter(Boolean).join(' ')}>${content}</button>`;
};
