"use client";

import { useGuestMutation } from "@/hooks/use-auth";
import { Button } from "@/components/ui";

export interface GuestLoginButtonProps {
  readonly children?: React.ReactNode;
  readonly className?: string;
  readonly variant?: "link" | "button";
  readonly intent?: "primary" | "secondary" | "ghost" | "harvest" | "outline";
  readonly size?: "sm" | "md" | "lg";
}

/** FR-01 revisi: masuk sebagai tamu, lalu ke katalog resep (bukan Explore). */
export function GuestLoginButton({
  children = "Lihat menu tanpa daftar",
  className,
  variant = "link",
  intent = "secondary",
  size = "lg",
}: GuestLoginButtonProps) {
  const mutation = useGuestMutation();

  const handleClick = () => {
    mutation.mutate(undefined, {
      onSuccess: () => {
        // Reload penuh agar state/cache user sebelumnya tidak terbawa.
        // B7: tamu diarahkan ke katalog resep — mesin rekomendasi hanya
        // untuk akun terdaftar sesuai FR-01 revisi.
        window.location.assign("/katalog");
      },
    });
  };

  if (variant === "button") {
    return (
      <Button
        intent={intent}
        size={size}
        loading={mutation.isPending}
        onClick={handleClick}
        className={className}
      >
        {children}
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={mutation.isPending}
      className={className ?? "text-sm font-semibold text-stone-500 hover:text-brand-700"}
    >
      {mutation.isPending ? "Memproses..." : children}
    </button>
  );
}
