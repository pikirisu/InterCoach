import { FileSearch, ListPlus, UploadCloud } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";

import { PageHeader } from "../components/layout/PageHeader";
import { Card, CardContent, CardHeader, EmptyState, ErrorState, LinkButton, Skeleton } from "../components/ui";
import { AnalysisService } from "../features/analysis/AnalysisService";
import { AnalysisList, type AnalysisHistoryItem } from "../features/analysis/components/AnalysisList";
import { ResumeService } from "../features/resume/ResumeService";
import { getApiErrorMessage } from "../utils/apiError";

function AnalysisHistorySkeleton() {
  return (
    <div>
      <div className="mb-8 space-y-3">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => <Skeleton className="h-28 w-full" key={index} />)}
      </div>
      <Card className="mt-6">
        <CardHeader>
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-44" />
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-2xl border border-slate-800">
            <div className="hidden grid-cols-[1.35fr_120px_120px_170px_130px] gap-4 border-b border-slate-800 bg-slate-800/40 px-4 py-3 xl:grid">
              {Array.from({ length: 5 }).map((_, index) => <Skeleton className="h-3 w-20" key={index} />)}
            </div>
            <div className="divide-y divide-slate-800">
              {Array.from({ length: 5 }).map((_, index) => (
                <div className="grid gap-4 px-4 py-4 xl:grid-cols-[1.35fr_120px_120px_170px_130px] xl:items-center" key={index}>
                  <div className="space-y-2"><Skeleton className="h-4 w-48 max-w-full" /><Skeleton className="h-3 w-28" /></div>
                  <Skeleton className="h-7 w-20 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-9 w-20 xl:ml-auto" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-semibold text-slate-50">{value}</p>
      </CardContent>
    </Card>
  );
}

export function AnalysisHistoryPage() {
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get("resumeId");
  const [analyses, setAnalyses] = useState<AnalysisHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (resumeId) {
        const [resumeResponse, historyResponse] = await Promise.all([
          ResumeService.getResume(resumeId),
          AnalysisService.getResumeAnalysisHistory(resumeId),
        ]);

        setAnalyses(
          historyResponse.data.analyses.map((analysis) => ({
            ...analysis,
            resumeFileName: resumeResponse.data.resume.fileName,
          })),
        );
        return;
      }

      const resumeResponse = await ResumeService.listResumes();
      const historyResponses = await Promise.all(
        resumeResponse.data.resumes.map(async (resume) => {
          const response = await AnalysisService.getResumeAnalysisHistory(resume.resumeId);

          return response.data.analyses.map((analysis) => ({
            ...analysis,
            resumeFileName: resume.fileName,
          }));
        }),
      );

      setAnalyses(historyResponses.flat().sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)));
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [resumeId]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const completedScores = useMemo(
    () => analyses.map((analysis) => analysis.overallScore).filter((score): score is number => typeof score === "number"),
    [analyses],
  );
  const averageScore = completedScores.length ? Math.round(completedScores.reduce((total, score) => total + score, 0) / completedScores.length) : 0;

  if (isLoading) {
    return <AnalysisHistorySkeleton />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadHistory} title="Unable to load analysis history" />;
  }

  return (
    <div className="animate-surface-in">
      <PageHeader
        actions={
          resumeId ? (
            <LinkButton to="/app/analysis" variant="secondary">View all reports</LinkButton>
          ) : (
            <LinkButton to="/app/upload"><UploadCloud aria-hidden="true" size={16} />Upload resume</LinkButton>
          )
        }
        description="Review generated resume analyses and open detailed AI feedback reports."
        eyebrow="Analysis"
        title="AI Analysis History"
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <SummaryCard label="Reports" value={String(analyses.length)} />
        <SummaryCard label="Completed" value={String(analyses.filter((analysis) => analysis.status === "completed").length)} />
        <SummaryCard label="Average score" value={completedScores.length ? String(averageScore) : "--"} />
      </div>

      {analyses.length ? (
        <AnalysisList analyses={analyses} />
      ) : (
        <EmptyState
          action={
            <LinkButton to="/app/resumes">
              <ListPlus aria-hidden="true" size={16} />
              Go to Library
            </LinkButton>
          }
          description="Create an analysis from a processed resume to build your feedback history."
          icon={FileSearch}
          title="No analyses found"
        />
      )}
    </div>
  );
}
