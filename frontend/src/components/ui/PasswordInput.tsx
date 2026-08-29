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
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-200" htmlFor={inputId}>
          {label}
        </label>
        <div className="relative">
          <input
            {...props}
            aria-describedby={describedBy}
            aria-invalid={error ? true : props["aria-invalid"]}
            className={cn(
              "h-11 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 pr-12 text-sm text-slate-50 outline-none transition placeholder:text-slate-500 hover:border-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20",
              error && "border-red-500/50 focus:border-red-400 focus:ring-red-500/20",
              className,
            )}
            id={inputId}
            ref={ref}
            type={isVisible ? "text" : "password"}
          />
          <button
            aria-label={isVisible ? "Hide password" : "Show password"}
            aria-pressed={isVisible}
            className="absolute inset-y-1 right-1 flex w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-800 hover:text-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20"
            onClick={() => setIsVisible((currentValue) => !currentValue)}
            type="button"
          >
            <Icon aria-hidden="true" size={18} />
          </button>
        </div>
        {error ? (
          <p className="text-sm text-red-400" id={errorId}>
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";
