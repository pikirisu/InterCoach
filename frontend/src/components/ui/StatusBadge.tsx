import { cn } from "../../utils/cn";
import { toTitleCase } from "../../utils/format";

type StatusTone = "neutral" | "success" | "warning" | "danger";

interface StatusBadgeProps {
  status: string;
  tone?: StatusTone;
}

const toneClasses: Record<StatusTone, string> = {
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-red-200 bg-red-50 text-red-700",
};

const dotClasses: Record<StatusTone, string> = {
  neutral: "bg-slate-400",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
};

const statusToneMap: Record<string, StatusTone> = {
  completed: "success",
  failed: "danger",
  processed: "success",
  processing: "warning",
  uploaded: "neutral",
};

export function StatusBadge({ status, tone = statusToneMap[status] ?? "neutral" }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        toneClasses[tone],
      )}
    >
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", dotClasses[tone])} />
      {toTitleCase(status)}
    </span>
  );
}
