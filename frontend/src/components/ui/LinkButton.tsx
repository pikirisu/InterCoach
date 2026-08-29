import { Link, type LinkProps } from "react-router";

import { cn } from "../../utils/cn";

// `cn` concatenates without resolving Tailwind conflicts, so a caller passing
// `bg-*`/`text-*` in className cannot reliably override a variant — whichever
// utility Tailwind emits last wins. Surfaces for dark heroes are variants, not
// overrides, so the rendered result is deterministic.
type LinkButtonVariant = "primary" | "secondary" | "ghost" | "inverse" | "inverseSubtle";
type LinkButtonSize = "sm" | "md" | "icon";

interface LinkButtonProps extends LinkProps {
  size?: LinkButtonSize;
  variant?: LinkButtonVariant;
}

const variantClasses: Record<LinkButtonVariant, string> = {
  primary:
    "border border-blue-500 bg-blue-500 text-white shadow-[0_10px_28px_rgba(0,0,0,0.35)] hover:border-blue-400 hover:bg-blue-400 focus-visible:ring-blue-500/30",
  secondary:
    "border border-slate-700 bg-slate-800 text-slate-100 hover:border-slate-600 hover:bg-slate-700 focus-visible:ring-blue-500/20",
  ghost: "border border-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-50 focus-visible:ring-blue-500/20",
  inverse:
    "border border-white/10 bg-white text-slate-950 shadow-[0_10px_28px_rgba(0,0,0,0.35)] hover:bg-blue-50 focus-visible:ring-white/30",
  inverseSubtle:
    "border border-white/10 bg-white/10 text-white hover:bg-white/15 focus-visible:ring-white/30",
};

const sizeClasses: Record<LinkButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  // Square, padding-free slot for icon-only controls. A size rather than a
  // className override, because `cn` cannot resolve a px-0/px-3 conflict.
  icon: "size-9 p-0",
};

export function LinkButton({ children, className, size = "md", variant = "primary", ...props }: LinkButtonProps) {
  return (
    <Link
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-200 focus:outline-none focus-visible:ring-4 active:translate-y-px",
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
