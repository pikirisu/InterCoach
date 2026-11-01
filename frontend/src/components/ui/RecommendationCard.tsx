import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./Card";
import type { AnalysisRecommendation, RecommendationPriority } from "../../types/analysis";

interface RecommendationCardProps {
  fallbackItems: string[];
  icon: LucideIcon;
  recommendations?: AnalysisRecommendation[];
  title: string;
  tone: string;
}

const PRIORITY_TONE: Record<RecommendationPriority, string> = {
  high: "border-red-500/20 bg-red-500/10 text-red-400",
  medium: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  low: "border-slate-600/40 bg-slate-700/30 text-slate-400",
};

function TargetLine({ recommendation }: { recommendation: AnalysisRecommendation }) {
  if (recommendation.evidenceType === "absence") {
    return (
      <p className="mt-2 text-xs leading-5 text-slate-400">
        <span className="font-semibold uppercase tracking-wide text-slate-500">Missing: </span>
        {recommendation.evidenceText}
      </p>
    );
  }

  return (
    <blockquote className="mt-2 border-l-2 border-slate-700 pl-3 text-xs italic leading-5 text-slate-400">
      &ldquo;{recommendation.evidenceText}&rdquo;
    </blockquote>
  );
}

export function RecommendationCard({ fallbackItems, icon: Icon, recommendations, title, tone }: RecommendationCardProps) {
  const hasDetails = Boolean(recommendations?.length);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={`flex size-10 items-center justify-center rounded-2xl border ${tone}`}>
            <Icon aria-hidden="true" size={18} />
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            {hasDetails ? <CardDescription>Ordered by the score each one can recover.</CardDescription> : null}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {hasDetails ? (
          <ol className="space-y-3 text-sm text-slate-300">
            {recommendations?.map((recommendation) => (
              <li
                className="rounded-2xl border border-slate-800 bg-slate-800/60 px-4 py-3 leading-6"
                key={`${recommendation.dimension}-${recommendation.evidenceText}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {recommendation.dimensionLabel}
                  </p>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${PRIORITY_TONE[recommendation.priority]}`}
                    title={`Up to ${recommendation.scoreUpside} points recoverable in this dimension`}
                  >
                    {recommendation.priority}
                    {recommendation.scoreUpside > 0 ? ` · +${recommendation.scoreUpside} pts` : ""}
                  </span>
                </div>
                <p className="mt-1">{recommendation.action}</p>
                <TargetLine recommendation={recommendation} />
                {recommendation.rewrite ? (
                  <p className="mt-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs leading-5 text-emerald-300">
                    <span className="font-semibold uppercase tracking-wide text-emerald-500/80">Rewrite: </span>
                    {recommendation.rewrite}
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
        ) : null}

        {!hasDetails && fallbackItems.length ? (
          <ul className="space-y-3 text-sm text-slate-300">
            {fallbackItems.map((item) => (
              <li className="rounded-2xl border border-slate-800 bg-slate-800/60 px-4 py-3 leading-6" key={item}>
                {item}
              </li>
            ))}
          </ul>
        ) : null}

        {!hasDetails && !fallbackItems.length ? (
          <p className="rounded-2xl border border-dashed border-slate-700 bg-slate-800/60 px-4 py-8 text-center text-sm text-slate-500">
            No items returned for this section.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
