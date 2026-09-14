import Link from "next/link";
import type { ComponentProps } from "react";
import { buttonVariants, type ButtonVariants } from "./button";
import { cn } from "@/lib/utils";

export interface ButtonLinkProps
  extends ComponentProps<typeof Link>,
    ButtonVariants {}

/** Tautan bergaya tombol (menggantikan button di dalam anchor yang tidak valid). */
export function ButtonLink({
  className,
  intent,
  size,
  fullWidth,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={cn(buttonVariants({ intent, size, fullWidth }), className)} {...props} />
  );
}
