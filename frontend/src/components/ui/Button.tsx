import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "../../utils/cn";
import { Spinner } from "./Spinner";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  leftIcon?: ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-blue-500 bg-blue-500 text-white shadow-[0_10px_28px_rgba(0,0,0,0.35)] hover:border-blue-400 hover:bg-blue-400 focus-visible:ring-blue-500/30",
  secondary:
    "border border-slate-700 bg-slate-800 text-slate-100 hover:border-slate-600 hover:bg-slate-700 focus-visible:ring-blue-500/20",
  ghost: "border border-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-50 focus-visible:ring-blue-500/20",
  danger:
    "border border-red-500 bg-red-500 text-white shadow-[0_10px_28px_rgba(0,0,0,0.35)] hover:border-red-400 hover:bg-red-400 focus-visible:ring-red-500/30",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  // Square, padding-free slot for icon-only controls. A size rather than a
  // className override, because `cn` cannot resolve a px-0/px-3 conflict.
  icon: "size-9 p-0",
};

export function Button({
  children,
  className,
  disabled,
  isLoading = false,
  leftIcon,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-200 focus:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60 active:translate-y-px",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={disabled || isLoading}
      type={type}
      {...props}
    >
      {isLoading ? <Spinner label="Working" size="sm" /> : leftIcon}
      {children}
    </button>
  );
}
