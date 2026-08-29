import type { LucideIcon } from "lucide-react";

interface MetricTileProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

export function MetricTile({ icon: Icon, label, value }: MetricTileProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
        <Icon aria-hidden="true" size={16} />
        {label}
      </div>
      <p className="mt-3 text-xl font-semibold text-slate-50">{value}</p>
    </div>
  );
}
