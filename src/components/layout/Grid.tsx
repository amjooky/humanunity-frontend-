import * as React from "react";
import { cn } from "@/lib/utils";

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  colsSm?: 1 | 2 | 3 | 4 | 5 | 6;
  colsMd?: 1 | 2 | 3 | 4 | 5 | 6 | 8 | 12;
  colsLg?: 1 | 2 | 3 | 4 | 5 | 6 | 8 | 12;
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
}

export function Grid({
  className,
  cols = 1,
  colsSm,
  colsMd,
  colsLg,
  gap = "md",
  ...props
}: GridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
    12: "grid-cols-12",
  };

  const gridSm = {
    1: "sm:grid-cols-1",
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-3",
    4: "sm:grid-cols-4",
    5: "sm:grid-cols-5",
    6: "sm:grid-cols-6",
  };

  const gridMd = {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
    5: "md:grid-cols-5",
    6: "md:grid-cols-6",
    8: "md:grid-cols-8",
    12: "md:grid-cols-12",
  };

  const gridLg = {
    1: "lg:grid-cols-1",
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
    5: "lg:grid-cols-5",
    6: "lg:grid-cols-6",
    8: "lg:grid-cols-8",
    12: "lg:grid-cols-12",
  };

  const gaps = {
    none: "gap-0",
    xs: "gap-2",
    sm: "gap-4",
    md: "gap-6 md:gap-8",
    lg: "gap-8 md:gap-12",
    xl: "gap-12 md:gap-16",
  };

  return (
    <div
      className={cn(
        "grid",
        gridCols[cols],
        colsSm && gridSm[colsSm],
        colsMd && gridMd[colsMd],
        colsLg && gridLg[colsLg],
        gaps[gap],
        className
      )}
      {...props}
    />
  );
}
