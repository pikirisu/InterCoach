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
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center px-6 py-12 text-center">
        <div className="flex size-11 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 shadow-sm shadow-slate-950/[0.02]">
          <Icon aria-hidden="true" size={21} />
        </div>
        <h2 className="mt-4 text-base font-semibold text-slate-950">{title}</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">{description}</p>
        {action ? <div className="mt-6">{action}</div> : null}
      </CardContent>
    </Card>
  );
}
