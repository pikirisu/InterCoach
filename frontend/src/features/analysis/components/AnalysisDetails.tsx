import { AlertTriangle, Bot, CheckCircle2, Lightbulb, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, StatusBadge } from "../../../components/ui";
import type { AnalysisRecord } from "../../../types/analysis";
import { formatDate } from "../../../utils/format";

interface AnalysisDetailsProps {
  analysis: AnalysisRecord;
}

function MetricTile({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
        <Icon aria-hidden="true" size={16} />
        {label}
      </div>
      <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function ResultList({ icon: Icon, items, title }: { icon: LucideIcon; items: string[]; title: string }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-700">
            <Icon aria-hidden="true" size={16} />
          </div>
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {items.length ? (
          <ul className="space-y-2 text-sm text-slate-700">
            {items.map((item) => (
              <li className="rounded-md border border-slate-200 bg-white px-3 py-2.5 leading-6" key={item}>
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-6 text-center text-sm text-slate-500">
            No items returned for this section.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function AnalysisDetails({ analysis }: AnalysisDetailsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Analysis Details</CardTitle>
              <CardDescription>Created {formatDate(analysis.createdAt)}</CardDescription>
            </div>
            <StatusBadge status={analysis.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricTile
              icon={TrendingUp}
              label="Overall Score"
              value={typeof analysis.overallScore === "number" ? String(analysis.overallScore) : "--"}
            />
            <MetricTile icon={Bot} label="AI Model" value={analysis.aiModel || "Not available"} />
            <MetricTile icon={CheckCircle2} label="Last Updated" value={formatDate(analysis.updatedAt)} />
          </div>

          {analysis.errorMessage ? (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm leading-6 text-red-700" role="alert">
              {analysis.errorMessage}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <ResultList icon={CheckCircle2} items={analysis.strengths} title="Strengths" />
        <ResultList icon={AlertTriangle} items={analysis.weaknesses} title="Weaknesses" />
        <ResultList icon={Lightbulb} items={analysis.recommendations} title="Recommendations" />
      </div>
    </div>
  );
}
