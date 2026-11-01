import { AlertTriangle, Bot, CheckCircle2, FileText, Lightbulb, Target, TrendingUp } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DimensionBreakdown,
  FindingCard,
  MetricTile,
  RecommendationCard,
  ScoreCircle,
  StatusBadge,
} from "../../../components/ui";
import type { AnalysisRecord } from "../../../types/analysis";
import type { ResumeDetail } from "../../../types/resume";
import { formatDate } from "../../../utils/format";

interface AnalysisDetailsProps {
  analysis: AnalysisRecord;
  resume?: ResumeDetail | null;
}

function getScore(analysis: AnalysisRecord) {
  return typeof analysis.overallScore === "number" ? analysis.overallScore : 0;
}

export function AnalysisDetails({ analysis, resume }: AnalysisDetailsProps) {
  const overallScore = getScore(analysis);
  const previewText = resume?.extractedText?.trim() || "Resume preview is unavailable for this analysis. Open the resume details page once extraction is complete.";
  const dimensions = analysis.dimensions ?? [];
  const strengthCount = analysis.strengthDetails?.length ?? analysis.strengths.length;
  const weaknessCount = analysis.weaknessDetails?.length ?? analysis.weaknesses.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Analysis overview</CardTitle>
              <CardDescription>Created {formatDate(analysis.createdAt)} with {analysis.aiModel || "the configured AI model"}.</CardDescription>
            </div>
            <StatusBadge status={analysis.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
            <ScoreCircle label={analysis.scoreBand ? `Overall score - ${analysis.scoreBand}` : "Overall score"} score={overallScore} />
            <div className="grid gap-4 sm:grid-cols-2">
              <MetricTile icon={Bot} label="AI model" value={analysis.aiModel || "Not available"} />
              <MetricTile icon={TrendingUp} label="Last updated" value={formatDate(analysis.updatedAt)} />
              <MetricTile icon={Target} label="Strengths" value={String(strengthCount)} />
              <MetricTile icon={AlertTriangle} label="Weaknesses" value={String(weaknessCount)} />
            </div>
          </div>

          {analysis.errorMessage ? (
            <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-400" role="alert">
              {analysis.errorMessage}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {dimensions.length ? <DimensionBreakdown dimensions={dimensions} /> : null}

      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl border border-slate-800 bg-slate-800/60 text-slate-300">
              <FileText aria-hidden="true" size={18} />
            </div>
            <div>
              <CardTitle>Resume preview</CardTitle>
              <CardDescription>{resume?.fileName ?? `Resume ${analysis.resumeId}`}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[620px] overflow-auto rounded-2xl border border-slate-800 bg-slate-800/60 p-5 shadow-inner">
            <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-7 text-slate-300">{previewText}</pre>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <FindingCard
          fallbackItems={analysis.strengths}
          findings={analysis.strengthDetails}
          icon={CheckCircle2}
          title="Strengths"
          tone="border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
        />
        <FindingCard
          fallbackItems={analysis.weaknesses}
          findings={analysis.weaknessDetails}
          icon={AlertTriangle}
          title="Weaknesses"
          tone="border-red-500/20 bg-red-500/10 text-red-400"
        />
        <RecommendationCard
          fallbackItems={analysis.recommendations}
          icon={Lightbulb}
          recommendations={analysis.recommendationDetails}
          title="Improvement suggestions"
          tone="border-amber-500/20 bg-amber-500/10 text-amber-400"
        />
      </div>
    </div>
  );
}
