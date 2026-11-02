import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends ComponentProps<"div"> {
  /** Intensitas permukaan kaca: default, lebih pekat, atau lebih bening. */
  readonly tone?: "default" | "strong" | "subtle";
  /** Radius sudut; default rounded-3xl. */
  readonly radius?: "2xl" | "3xl";
}

const TONE_CLASS: Readonly<Record<NonNullable<GlassCardProps["tone"]>, string>> = {
  default: "glass",
  strong: "glass-strong",
  subtle: "glass-subtle",
};

const RADIUS_CLASS: Readonly<Record<NonNullable<GlassCardProps["radius"]>, string>> = {
  "2xl": "rounded-2xl",
  "3xl": "rounded-3xl",
};

/** Permukaan glassmorphism reusable (RSC-safe). */
export function GlassCard({
  className,
  tone = "default",
  radius = "3xl",
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(TONE_CLASS[tone], RADIUS_CLASS[radius], className)}
      {...props}
    />
  );
}
