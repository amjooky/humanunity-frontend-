import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, id, ...props }, ref) => {
    const selectId = id || React.useId();

    return (
      <div className="w-full flex flex-col gap-1.5 text-left rtl:text-right">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-display font-medium uppercase tracking-wider text-text-secondary select-none"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              "w-full px-5 py-3.5 bg-surface-50 border border-border-default rounded-xl font-body text-sm text-text-primary transition-all duration-normal focus:outline-none focus:border-border-focus focus:ring-1 focus:ring-primary-500/20 disabled:opacity-50 disabled:bg-surface-100 appearance-none cursor-pointer",
              error && "border-error focus:border-error focus:ring-error/20",
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-4 pointer-events-none flex items-center justify-center text-text-secondary rtl:right-auto rtl:left-4">
            <svg
              className="h-4 w-4 fill-none stroke-current"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
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

Select.displayName = "Select";

export { Select };
