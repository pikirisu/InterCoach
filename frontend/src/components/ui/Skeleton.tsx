import type { HTMLAttributes } from "react";

import { cn } from "../../utils/cn";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-slate-800 before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:content-[''] before:[animation:shimmer_1.35s_infinite]",
        className,
      )}
      {...props}
    />
  );
}
