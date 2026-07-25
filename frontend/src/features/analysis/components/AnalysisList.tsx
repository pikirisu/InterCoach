import { Eye, FileSearch } from "lucide-react";

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
        <CardTitle className="text-lg">Analysis History</CardTitle>
        <CardDescription>{analyses.length} generated report{analyses.length === 1 ? "" : "s"}.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="hidden grid-cols-[1.3fr_120px_120px_170px_110px] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium uppercase text-slate-500 lg:grid">
            <span>Resume</span>
            <span>Status</span>
            <span>Score</span>
            <span>Created</span>
            <span className="text-right">Action</span>
          </div>

          <div className="divide-y divide-slate-200">
            {analyses.map((analysis) => (
              <div
                className="grid gap-4 px-4 py-4 transition-colors hover:bg-slate-50/70 lg:grid-cols-[1.3fr_120px_120px_170px_110px] lg:items-center lg:gap-4"
                key={analysis.analysisId}
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="hidden size-9 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 sm:flex">
                    <FileSearch aria-hidden="true" size={17} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-950">
                      {analysis.resumeFileName ?? "Resume analysis"}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500 lg:hidden">Created {formatDate(analysis.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 lg:block">
                  <span className="text-xs font-medium uppercase text-slate-500 lg:hidden">Status</span>
                  <StatusBadge status={analysis.status} />
                </div>
                <div className="flex items-center justify-between gap-3 text-sm text-slate-600 lg:block">
                  <span className="text-xs font-medium uppercase text-slate-500 lg:hidden">Score</span>
                  {getScoreLabel(analysis.overallScore)}
                </div>
                <p className="hidden text-sm text-slate-600 lg:block">{formatDate(analysis.createdAt)}</p>
                <div className="flex justify-start lg:justify-end">
                  <LinkButton size="sm" to={`/app/analysis/${analysis.analysisId}`} variant="secondary">
                    <Eye aria-hidden="true" size={16} />
                    View
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
