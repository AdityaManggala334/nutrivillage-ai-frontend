"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, type ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { fieldBase } from "./input";

export interface PasswordInputProps extends Omit<ComponentProps<"input">, "type"> {
  readonly invalid?: boolean;
}

/**
 * Input password dengan tombol lihat/sembunyikan (ikon mata).
 *
 * `name` dan `autoComplete` sengaja diteruskan apa adanya agar pengelola
 * password peramban (autofill: simpan & isi otomatis) tetap bekerja.
 */
export function PasswordInput({ className, invalid = false, ...props }: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={isVisible ? "text" : "password"}
        aria-invalid={invalid || undefined}
        className={cn(
          fieldBase,
          "pr-11",
          invalid
            ? "border-red-400 focus:border-red-500 focus:ring-red-500/30"
            : "border-stone-300 dark:border-stone-700",
          className,
        )}
      />
      <button
        type="button"
        onClick={() => setIsVisible((current) => !current)}
        aria-label={isVisible ? "Sembunyikan password" : "Tampilkan password"}
        aria-pressed={isVisible}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-stone-400 transition hover:text-stone-600 focus-visible:text-brand-600 focus-visible:outline-none dark:hover:text-stone-200"
      >
        {isVisible ? (
          <EyeOff className="size-4" aria-hidden="true" />
        ) : (
          <Eye className="size-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
