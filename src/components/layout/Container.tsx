import * as React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "max";
}

export function Container({
  className,
  size = "xl",
  ...props
}: ContainerProps) {
  const sizes = {
    xs: "max-w-(--container-xs)",
    sm: "max-w-(--container-sm)",
    md: "max-w-(--container-md)",
    lg: "max-w-(--container-lg)",
    xl: "max-w-(--container-xl)",
    "2xl": "max-w-(--container-2xl)",
    max: "max-w-(--container-max)",
  };

  return (
    <div
      className={cn("w-full mx-auto px-4 md:px-8", sizes[size], className)}
      {...props}
    />
  );
}
