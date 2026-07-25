import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useId, useState, type InputHTMLAttributes } from "react";

import { cn } from "../../utils/cn";

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  error?: string;
  label: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, error, id, label, ...props }, ref) => {
    const [isVisible, setIsVisible] = useState(false);
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const describedBy = [props["aria-describedby"], error ? errorId : null].filter(Boolean).join(" ") || undefined;
    const Icon = isVisible ? EyeOff : Eye;

    return (
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700" htmlFor={inputId}>
          {label}
        </label>
        <div className="relative">
          <input
            {...props}
            aria-describedby={describedBy}
            aria-invalid={error ? true : props["aria-invalid"]}
            className={cn(
              "h-10 w-full rounded-md border border-slate-200 bg-white px-3 pr-11 text-sm text-slate-950 shadow-sm shadow-slate-950/[0.02] outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100",
              error && "border-red-300 focus:border-red-400 focus:ring-red-100",
              className,
            )}
            id={inputId}
            ref={ref}
            type={isVisible ? "text" : "password"}
          />
          <button
            aria-label={isVisible ? "Hide password" : "Show password"}
            aria-pressed={isVisible}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-slate-500 transition hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-200"
            onClick={() => setIsVisible((currentValue) => !currentValue)}
            type="button"
          >
            <Icon aria-hidden="true" size={18} />
          </button>
        </div>
        {error ? (
          <p className="text-sm text-red-600" id={errorId}>
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";
