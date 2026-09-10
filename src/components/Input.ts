import { cva, type VariantProps } from 'class-variance-authority';
import { cn, escapeHtml } from './utils';

export const inputVariants = cva(
  'block w-full rounded-xl border bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-0 disabled:bg-stone-100 disabled:text-stone-500',
  {
    variants: {
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-3.5 text-sm',
      },
      state: {
        default: 'border-stone-300',
        error: 'border-red-400 focus-visible:ring-red-500',
      },
    },
    defaultVariants: {
      size: 'md',
      state: 'default',
    },
  },
);

export type InputVariants = VariantProps<typeof inputVariants>;

export interface InputProps extends InputVariants {
  readonly id: string;
  readonly name: string;
  readonly label: string;
  readonly type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  readonly value?: string;
  readonly placeholder?: string;
  readonly autocomplete?: string;
  readonly required?: boolean;
  readonly error?: string;
  readonly hint?: string;
  readonly inputMode?: 'text' | 'numeric' | 'decimal' | 'email' | 'tel';
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly fieldKey?: string;
}

const fieldError = (id: string, key: string, error: string | undefined): string =>
  `<p id="${id}-error" data-error-for="${escapeHtml(key)}" role="alert" class="mt-1 min-h-5 text-xs text-red-600">${error ? escapeHtml(error) : ''}</p>`;

/** Merender input headless lengkap dengan label, hint, dan pesan error aksesibel. */
export const renderInput = (props: InputProps): string => {
  const {
    id,
    name,
    label,
    type = 'text',
    value,
    placeholder,
    autocomplete,
    required = false,
    error,
    hint,
    inputMode,
    min,
    max,
    step,
    size = 'md',
    state,
    fieldKey,
  } = props;

  const hasError = typeof error === 'string' && error.length > 0;
  const resolvedState = state ?? (hasError ? 'error' : 'default');
  const classes = cn(inputVariants({ size, state: resolvedState }));

  const describedBy = [hint ? `${id}-hint` : '', `${id}-error`].filter(Boolean).join(' ');
  const attrs: string[] = [
    `id="${escapeHtml(id)}"`,
    `name="${escapeHtml(name)}"`,
    `type="${type}"`,
    `class="${classes}"`,
    `aria-describedby="${describedBy}"`,
    hasError ? 'aria-invalid="true"' : '',
    required ? 'required' : '',
    value !== undefined ? `value="${escapeHtml(value)}"` : '',
    placeholder ? `placeholder="${escapeHtml(placeholder)}"` : '',
    autocomplete ? `autocomplete="${escapeHtml(autocomplete)}"` : '',
    inputMode ? `inputmode="${inputMode}"` : '',
    min !== undefined ? `min="${String(min)}"` : '',
    max !== undefined ? `max="${String(max)}"` : '',
    step !== undefined ? `step="${String(step)}"` : '',
    `data-field="${escapeHtml(fieldKey ?? name)}"`,
  ];

  return `<div class="mb-1">
    <label for="${escapeHtml(id)}" class="mb-1.5 block text-sm font-medium text-stone-700">
      ${escapeHtml(label)}${required ? ' <span class="text-red-500" aria-hidden="true">*</span>' : ''}
    </label>
    <input ${attrs.filter(Boolean).join(' ')} />
    ${hint ? `<p id="${id}-hint" class="mt-1 text-xs text-stone-500">${escapeHtml(hint)}</p>` : ''}
    ${fieldError(id, fieldKey ?? name, error)}
  </div>`;
};

export interface SelectOption {
  readonly value: string;
  readonly label: string;
}

export interface SelectProps extends Omit<InputProps, 'type' | 'inputMode' | 'min' | 'max' | 'step'> {
  readonly options: readonly SelectOption[];
}

/** Merender select headless dengan gaya yang sama seperti input. */
export const renderSelect = (props: SelectProps): string => {
  const {
    id,
    name,
    label,
    value,
    options,
    required = false,
    error,
    hint,
    size = 'md',
    state,
    fieldKey,
  } = props;

  const hasError = typeof error === 'string' && error.length > 0;
  const resolvedState = state ?? (hasError ? 'error' : 'default');
  const classes = cn(inputVariants({ size, state: resolvedState }));
  const describedBy = [hint ? `${id}-hint` : '', `${id}-error`].filter(Boolean).join(' ');

  const optionsHtml = options
    .map(
      (option) =>
        `<option value="${escapeHtml(option.value)}"${option.value === value ? ' selected' : ''}>${escapeHtml(option.label)}</option>`,
    )
    .join('');

  return `<div class="mb-1">
    <label for="${escapeHtml(id)}" class="mb-1.5 block text-sm font-medium text-stone-700">
      ${escapeHtml(label)}${required ? ' <span class="text-red-500" aria-hidden="true">*</span>' : ''}
    </label>
    <select id="${escapeHtml(id)}" name="${escapeHtml(name)}" class="${classes}"
      aria-describedby="${describedBy}" data-field="${escapeHtml(fieldKey ?? name)}"
      ${hasError ? 'aria-invalid="true"' : ''} ${required ? 'required' : ''}>
      ${optionsHtml}
    </select>
    ${hint ? `<p id="${id}-hint" class="mt-1 text-xs text-stone-500">${escapeHtml(hint)}</p>` : ''}
    ${fieldError(id, fieldKey ?? name, error)}
  </div>`;
};
