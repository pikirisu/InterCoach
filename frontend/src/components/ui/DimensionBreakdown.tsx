import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./Card";
import type { AnalysisDimension, AnalysisLevel } from "../../types/analysis";

interface DimensionBreakdownProps {
  dimensions: AnalysisDimension[];
}

const LEVEL_POINTS: Record<AnalysisLevel, number> = {
  weak: 0,
  adequate: 1,
  strong: 2,
  exceptional: 3,
};

const LEVEL_TONE: Record<AnalysisLevel, string> = {
  weak: "border-red-500/20 bg-red-500/10 text-red-400",
  adequate: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  strong: "border-sky-500/20 bg-sky-500/10 text-sky-400",
  exceptional: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
};

const LEVEL_BAR: Record<AnalysisLevel, string> = {
  weak: "bg-red-500/70",
  adequate: "bg-amber-500/70",
  strong: "bg-sky-500/70",
  exceptional: "bg-emerald-500/70",
};

export function DimensionBreakdown({ dimensions }: DimensionBreakdownProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Score breakdown</CardTitle>
        <CardDescription>
          The overall score is the weighted total of these six ratings, computed
          in code rather than returned by the model.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {dimensions.map((dimension) => {
            const fill = (LEVEL_POINTS[dimension.level] / 3) * 100;

            return (
              <li key={dimension.key}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-200">
                    {dimension.label}
                    <span className="ml-2 text-xs text-slate-500">
                      {dimension.weight}% of score
                    </span>
                  </p>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${LEVEL_TONE[dimension.level]}`}
                  >
                    {dimension.level}
                  </span>
                </div>
                <div
                  aria-label={`${dimension.label}: ${dimension.level}`}
                  className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800"
                  role="img"
                >
                  <div
                    className={`h-full rounded-full ${LEVEL_BAR[dimension.level]}`}
                    style={{ width: `${fill}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
