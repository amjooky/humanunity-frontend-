"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  quantity: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

export function QuantitySelector({
  quantity,
  min = 1,
  max = 99,
  onChange,
  disabled = false,
  className,
}: QuantitySelectorProps) {
  const handleDecrement = () => {
    if (quantity > min) {
      onChange(quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < max) {
      onChange(quantity + 1);
    }
  };

  return (
    <div
      className={cn(
        "inline-flex items-center bg-surface-200 rounded-full p-1 border border-border-default select-none",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        onClick={handleDecrement}
        disabled={quantity <= min || disabled}
        className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
        aria-label="Decrease quantity"
      >
        <svg
          className="w-4 h-4 stroke-current fill-none"
          viewBox="0 0 24 24"
          strokeWidth="2.5"
        >
          <path d="M5 12h14" />
        </svg>
      </motion.button>
      <span className="w-8 text-center font-display font-medium text-sm text-text-primary">
        {quantity}
      </span>
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        onClick={handleIncrement}
        disabled={quantity >= max || disabled}
        className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
        aria-label="Increase quantity"
      >
        <svg
          className="w-4 h-4 stroke-current fill-none"
          viewBox="0 0 24 24"
          strokeWidth="2.5"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </motion.button>
    </div>
  );
}
