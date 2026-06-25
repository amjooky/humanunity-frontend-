"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedSectionProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  duration?: number;
}

export function AnimatedSection({
  children,
  className,
  delay = 0,
  direction = "up",
  duration = 0.8,
  ...props
}: AnimatedSectionProps) {
  const directions = {
    up: { y: 30, x: 0 },
    down: { y: -30, x: 0 },
    left: { x: 30, y: 0 },
    right: { x: -30, y: 0 },
    none: { x: 0, y: 0 },
  };

  const initialOffset = directions[direction];

  return (
    <motion.div
      initial={{
        opacity: 0,
        ...initialOffset,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
      }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration: duration,
        delay: delay,
        ease: [0.16, 1, 0.3, 1], // Custom luxury ease
      }}
      className={cn(className)}
      {...props}
    >
      {children as any}
    </motion.div>
  );
}
