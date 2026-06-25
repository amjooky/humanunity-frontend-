import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "error" | "info" | "gold";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "primary",
  size = "md",
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-display font-medium uppercase tracking-widest rounded-full select-none";

  const variants = {
    primary: "bg-primary-50 text-primary-600 border border-primary-100",
    secondary: "bg-surface-200 text-text-secondary",
    success: "bg-green-50 text-success border border-green-100",
    warning: "bg-yellow-50 text-warning border border-yellow-100",
    error: "bg-red-50 text-error border border-red-100",
    info: "bg-blue-50 text-info border border-blue-100",
    gold: "bg-accent-50 text-accent-500 border border-accent-100",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[9px]",
    md: "px-3 py-1 text-[10px]",
  };

  return (
    <span
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
