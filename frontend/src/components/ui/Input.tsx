import { forwardRef, useId, type InputHTMLAttributes } from "react";

import { cn } from "../../utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, id, label, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const describedBy = [props["aria-describedby"], error ? errorId : null].filter(Boolean).join(" ") || undefined;

    return (
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700" htmlFor={inputId}>
          {label}
        </label>
        <input
          {...props}
          aria-describedby={describedBy}
          aria-invalid={error ? true : props["aria-invalid"]}
          className={cn(
            "h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 shadow-sm shadow-slate-950/[0.02] outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100",
            error && "border-red-300 focus:border-red-400 focus:ring-red-100",
            className,
          )}
          id={inputId}
          ref={ref}
        />
        {error ? (
          <p className="text-sm text-red-600" id={errorId}>
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
