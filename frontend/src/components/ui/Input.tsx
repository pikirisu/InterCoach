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
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-200" htmlFor={inputId}>
          {label}
        </label>
        <input
          {...props}
          aria-describedby={describedBy}
          aria-invalid={error ? true : props["aria-invalid"]}
          className={cn(
            "h-11 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 text-sm text-slate-50 outline-none transition placeholder:text-slate-500 hover:border-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20",
            error && "border-red-500/50 focus:border-red-400 focus:ring-red-500/20",
            className,
          )}
          id={inputId}
          ref={ref}
        />
        {error ? (
          <p className="text-sm text-red-400" id={errorId}>
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
