import { Link, type LinkProps } from "react-router";

import { cn } from "../../utils/cn";

type LinkButtonVariant = "primary" | "secondary" | "ghost";
type LinkButtonSize = "sm" | "md";

interface LinkButtonProps extends LinkProps {
  size?: LinkButtonSize;
  variant?: LinkButtonVariant;
}

const variantClasses: Record<LinkButtonVariant, string> = {
  primary:
    "bg-slate-950 text-white shadow-sm shadow-slate-950/10 hover:bg-slate-800 focus-visible:ring-slate-300",
  secondary:
    "border border-slate-200 bg-white text-slate-900 shadow-sm shadow-slate-950/[0.03] hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-slate-200",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-950 focus-visible:ring-slate-200",
};

const sizeClasses: Record<LinkButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
};

export function LinkButton({ children, className, size = "md", variant = "primary", ...props }: LinkButtonProps) {
  return (
    <Link
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-150 focus:outline-none focus-visible:ring-2 active:translate-y-px",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
