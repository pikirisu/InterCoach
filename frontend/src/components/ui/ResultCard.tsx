import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "./Card";

interface ResultCardProps {
  icon: LucideIcon;
  items: string[];
  title: string;
  tone: string;
}

export function ResultCard({ icon: Icon, items, title, tone }: ResultCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={`flex size-10 items-center justify-center rounded-2xl border ${tone}`}>
            <Icon aria-hidden="true" size={18} />
          </div>
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {items.length ? (
          <ul className="space-y-3 text-sm text-slate-300">
            {items.map((item) => (
              <li className="rounded-2xl border border-slate-800 bg-slate-800/60 px-4 py-3 leading-6" key={item}>
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-700 bg-slate-800/60 px-4 py-8 text-center text-sm text-slate-500">
            No items returned for this section.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
