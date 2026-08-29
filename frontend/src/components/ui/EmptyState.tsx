import { Inbox } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Card, CardContent } from "./Card";

interface EmptyStateProps {
  action?: ReactNode;
  description: string;
  icon?: LucideIcon;
  title: string;
}

export function EmptyState({ action, description, icon: Icon = Inbox, title }: EmptyStateProps) {
  return (
    <Card className="border-dashed border-slate-700 bg-slate-900/60">
      <CardContent className="flex flex-col items-center px-6 py-14 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
          <Icon aria-hidden="true" size={22} />
        </div>
        <h2 className="mt-5 text-lg font-semibold text-slate-50">{title}</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">{description}</p>
        {action ? <div className="mt-7">{action}</div> : null}
      </CardContent>
    </Card>
  );
}
