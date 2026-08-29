import { ArrowRight, Eye, FileSearch } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, LinkButton, StatusBadge } from "../../../components/ui";
import type { AnalysisRecord } from "../../../types/analysis";
import { formatDate } from "../../../utils/format";

export interface AnalysisHistoryItem extends AnalysisRecord {
  resumeFileName?: string;
}

interface AnalysisListProps {
  analyses: AnalysisHistoryItem[];
}

const getScoreLabel = (score?: number) => (typeof score === "number" ? `${score}/100` : "Pending");

export function AnalysisList({ analyses }: AnalysisListProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Analysis History</CardTitle>
            <CardDescription>{analyses.length} generated report{analyses.length === 1 ? "" : "s"} ready for review.</CardDescription>
          </div>
          <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">AI reports</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="hidden grid-cols-[1.35fr_120px_120px_170px_130px] gap-4 border-b border-slate-800 bg-slate-800/40 px-4 py-3 text-xs font-semibold uppercase text-slate-500 xl:grid">
            <span>Resume</span>
            <span>Status</span>
            <span>Score</span>
            <span>Created</span>
            <span className="text-right">Action</span>
          </div>

          <div className="divide-y divide-slate-800">
            {analyses.map((analysis) => (
              <div
                className="grid gap-4 px-4 py-4 transition-colors hover:bg-slate-800/40 xl:grid-cols-[1.35fr_120px_120px_170px_130px] xl:items-center xl:gap-4"
                key={analysis.analysisId}
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="hidden size-10 shrink-0 items-center justify-center rounded-2xl border border-slate-800 bg-slate-800/60 text-blue-400 sm:flex">
                    <FileSearch aria-hidden="true" size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-50">{analysis.resumeFileName ?? "Resume analysis"}</p>
                    <p className="mt-1 truncate text-xs text-slate-500 xl:hidden">Created {formatDate(analysis.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 xl:block">
                  <span className="text-xs font-semibold uppercase text-slate-500 xl:hidden">Status</span>
                  <StatusBadge status={analysis.status} />
                </div>
                <div className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-300 xl:block">
                  <span className="text-xs font-semibold uppercase text-slate-500 xl:hidden">Score</span>
                  {getScoreLabel(analysis.overallScore)}
                </div>
                <p className="hidden text-sm text-slate-400 xl:block">{formatDate(analysis.createdAt)}</p>
                <div className="flex justify-start xl:justify-end">
                  <LinkButton size="sm" to={`/app/analysis/${analysis.analysisId}`} variant="secondary">
                    <Eye aria-hidden="true" size={16} />
                    View
                    <ArrowRight aria-hidden="true" size={15} />
                  </LinkButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
