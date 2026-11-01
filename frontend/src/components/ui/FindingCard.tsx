import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import type { AnalysisFinding } from "../../types/analysis";

interface FindingCardProps {
  fallbackItems: string[];
  findings?: AnalysisFinding[];
  icon: LucideIcon;
  title: string;
  tone: string;
}

function EvidenceLine({ finding }: { finding: AnalysisFinding }) {
  if (finding.evidenceType === "absence") {
    return (
      <p className="mt-2 text-xs leading-5 text-slate-400">
        <span className="font-semibold uppercase tracking-wide text-slate-500">Not found in resume: </span>
        {finding.evidenceText}
      </p>
    );
  }

  return (
    <blockquote className="mt-2 border-l-2 border-slate-700 pl-3 text-xs italic leading-5 text-slate-400">
      &ldquo;{finding.evidenceText}&rdquo;
    </blockquote>
  );
}

export function FindingCard({ fallbackItems, findings, icon: Icon, title, tone }: FindingCardProps) {
  const hasFindings = Boolean(findings?.length);

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
        {hasFindings ? (
          <ul className="space-y-3 text-sm text-slate-300">
            {findings?.map((finding) => (
              <li
                className="rounded-2xl border border-slate-800 bg-slate-800/60 px-4 py-3 leading-6"
                key={`${finding.dimension}-${finding.observation}`}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{finding.dimensionLabel}</p>
                <p className="mt-1">{finding.observation}</p>
                <EvidenceLine finding={finding} />
                {finding.impact ? <p className="mt-2 text-xs leading-5 text-slate-500">{finding.impact}</p> : null}
              </li>
            ))}
          </ul>
        ) : null}

        {!hasFindings && fallbackItems.length ? (
          <ul className="space-y-3 text-sm text-slate-300">
            {fallbackItems.map((item) => (
              <li className="rounded-2xl border border-slate-800 bg-slate-800/60 px-4 py-3 leading-6" key={item}>
                {item}
              </li>
            ))}
          </ul>
        ) : null}

        {!hasFindings && !fallbackItems.length ? (
          <p className="rounded-2xl border border-dashed border-slate-700 bg-slate-800/60 px-4 py-8 text-center text-sm text-slate-500">
            No items returned for this section.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
