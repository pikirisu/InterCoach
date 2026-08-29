import { cn } from "../../utils/cn";
import { toTitleCase } from "../../utils/format";

type StatusTone = "neutral" | "success" | "warning" | "danger";

interface StatusBadgeProps {
  status: string;
  tone?: StatusTone;
}

const toneClasses: Record<StatusTone, string> = {
  neutral: "border-slate-700 bg-slate-800 text-slate-300",
  success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  warning: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  danger: "border-red-500/20 bg-red-500/10 text-red-400",
};

const dotClasses: Record<StatusTone, string> = {
  neutral: "bg-slate-400",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
};

const statusToneMap: Record<string, StatusTone> = {
  completed: "success",
  extracted: "success",
  failed: "danger",
  pending: "warning",
  processed: "success",
  processing: "warning",
  uploaded: "neutral",
};

export function StatusBadge({ status, tone = statusToneMap[status] ?? "neutral" }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        toneClasses[tone],
      )}
    >
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", dotClasses[tone])} />
      {toTitleCase(status)}
    </span>
  );
}
