import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Informasi aturan password yang tampil langsung saat pengguna mengetik.
 * Dipakai di form Registrasi dan form Ganti Password (halaman Profil).
 */

/** Aturan password minimal (selaras dengan skema frontend & backend). */
export const PASSWORD_MIN_LENGTH = 8;

export interface PasswordRule {
  readonly label: string;
  readonly test: (value: string) => boolean;
}

export const PASSWORD_RULES: readonly PasswordRule[] = [
  {
    label: `Minimal ${PASSWORD_MIN_LENGTH} karakter`,
    test: (value) => value.length >= PASSWORD_MIN_LENGTH,
  },
  { label: "Memuat huruf (A-Z / a-z)", test: (value) => /[A-Za-z]/.test(value) },
  { label: "Memuat angka (0-9)", test: (value) => /[0-9]/.test(value) },
];

/** True bila seluruh aturan wajib sudah terpenuhi. */
export const isPasswordValid = (value: string): boolean =>
  PASSWORD_RULES.every((rule) => rule.test(value));

interface PasswordStrength {
  readonly label: string;
  readonly level: 1 | 2 | 3;
  readonly tone: string;
}

const strengthOf = (value: string): PasswordStrength => {
  let score = 0;
  if (value.length >= PASSWORD_MIN_LENGTH) score += 1;
  if (/[A-Za-z]/.test(value) && /[0-9]/.test(value)) score += 1;
  if (value.length >= 12 || /[^A-Za-z0-9]/.test(value)) score += 1;

  if (score <= 1) return { label: "Lemah", level: 1, tone: "bg-red-500" };
  if (score === 2) return { label: "Sedang", level: 2, tone: "bg-amber-500" };
  return { label: "Kuat", level: 3, tone: "bg-brand-600" };
};

export interface PasswordChecklistProps {
  readonly value: string;
  /** Dipakai kolom input `aria-describedby`. */
  readonly id?: string;
  readonly className?: string;
}

export function PasswordChecklist({ value, id, className }: PasswordChecklistProps) {
  const strength = strengthOf(value);

  return (
    <div className={cn("space-y-1.5", className)}>
      <ul id={id} aria-live="polite" className="space-y-1 text-xs">
        {PASSWORD_RULES.map((rule) => {
          const isMet = rule.test(value);
          return (
            <li
              key={rule.label}
              className={cn(
                "flex items-center gap-1.5 transition-colors",
                isMet
                  ? "font-medium text-brand-700 dark:text-brand-300"
                  : "text-stone-500 dark:text-stone-400",
              )}
            >
              {isMet ? (
                <>
                  <Check className="size-3.5 shrink-0" aria-hidden="true" />
                  <span className="sr-only">Terpenuhi: </span>
                </>
              ) : (
                <Circle className="size-2.5 shrink-0" aria-hidden="true" />
              )}
              {rule.label}
            </li>
          );
        })}
      </ul>

      {value ? (
        <div className="flex items-center gap-2">
          <span
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700"
            role="presentation"
          >
            <span
              className={cn("block h-full rounded-full transition-all", strength.tone)}
              style={{ width: `${(strength.level / 3) * 100}%` }}
            />
          </span>
          <span className="text-xs font-medium text-stone-600 dark:text-stone-300">
            Kekuatan: {strength.label}
          </span>
        </div>
      ) : null}
    </div>
  );
}
