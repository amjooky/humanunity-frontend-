import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, helperText, id, ...props }, ref) => {
    const inputId = id || React.useId();
    
    return (
      <div className="w-full flex flex-col gap-1.5 text-left rtl:text-right">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-display font-medium uppercase tracking-wider text-text-secondary select-none"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              "w-full px-5 py-3.5 bg-surface-50 border border-border-default rounded-xl font-body text-sm text-text-primary placeholder-text-tertiary transition-all duration-normal focus:outline-none focus:border-border-focus focus:ring-1 focus:ring-primary-500/20 disabled:opacity-50 disabled:bg-surface-100",
              error && "border-error focus:border-error focus:ring-error/20",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs font-body text-error mt-0.5">{error}</p>
        )}
        {!error && helperText && (
          <p className="text-xs font-body text-text-tertiary mt-0.5">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
