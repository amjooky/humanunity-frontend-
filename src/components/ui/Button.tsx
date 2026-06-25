import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "gold"
    | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    // Sharp, editorial brutalist base — no rounded-full, tight tracking
    const baseStyles =
      "inline-flex items-center justify-center font-display font-bold tracking-[0.12em] uppercase transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-black/20 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 select-none cursor-pointer relative overflow-hidden";

    const variants = {
      primary:
        "bg-black text-white hover:bg-neutral-800 shadow-[0_2px_0_0_rgba(0,0,0,0.3)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:-translate-y-0.5",
      secondary:
        "bg-neutral-100 text-black border border-neutral-200 hover:bg-neutral-200 hover:border-neutral-300",
      outline:
        "bg-transparent border-2 border-black text-black hover:bg-black hover:text-white",
      ghost:
        "bg-transparent text-black hover:bg-neutral-100 border border-transparent hover:border-neutral-200",
      gold:
        "bg-black text-white hover:bg-neutral-800 shadow-sm hover:shadow-md hover:-translate-y-0.5",
      danger:
        "bg-red-600 text-white hover:bg-red-700 shadow-sm",
    };

    const sizes = {
      sm: "px-4 py-2 text-[10px]",
      md: "px-6 py-3 text-[10px]",
      lg: "px-8 py-4 text-xs",
      icon: "h-10 w-10 p-0",
    };

    return (
      <button
        ref={ref}
        type={type}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!isLoading && leftIcon && <span className="mr-2 rtl:ml-2 rtl:mr-0 inline-flex">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2 rtl:mr-2 rtl:ml-0 inline-flex">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
