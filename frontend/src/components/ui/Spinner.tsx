import { LoaderCircle } from "lucide-react";

import { cn } from "../../utils/cn";

interface SpinnerProps {
  className?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "size-4",
  md: "size-5",
  lg: "size-7",
};

export function Spinner({ className, label = "Loading", size = "md" }: SpinnerProps) {
  return (
    <span aria-label={label} className={cn("inline-flex items-center justify-center text-current", className)} role="status">
      <LoaderCircle aria-hidden="true" className={cn("animate-spin", sizeClasses[size])} />
      <span className="sr-only">{label}</span>
    </span>
  );
}
