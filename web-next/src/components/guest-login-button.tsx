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

/** FR-03: masuk sebagai tamu lalu diarahkan ke Explore. */
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
        window.location.assign("/explore");
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
