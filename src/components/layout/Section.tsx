import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: "section" | "div" | "header" | "footer";
  padding?: "none" | "sm" | "md" | "lg" | "luxury";
  background?: "transparent" | "cream" | "white" | "dark";
}

export function Section({
  className,
  as: Component = "section",
  padding = "luxury",
  background = "transparent",
  ...props
}: SectionProps) {
  const paddings = {
    none: "py-0",
    sm: "py-8 md:py-12",
    md: "py-12 md:py-20",
    lg: "py-20 md:py-32",
    luxury: "py-16 md:py-32",
  };

  const backgrounds = {
    transparent: "",
    cream: "bg-surface-100",
    white: "bg-surface-50",
    dark: "bg-primary-950 text-white",
  };

  return (
    <Component
      className={cn(paddings[padding], backgrounds[background], className)}
      {...props}
    />
  );
}
