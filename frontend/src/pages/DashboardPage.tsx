import { ArrowUpRight, BarChart3, FileText, Inbox, ListChecks, Upload } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { PageHeader } from "../components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, ErrorState, LinkButton, Skeleton, StatusBadge } from "../components/ui";
import { AnalysisService } from "../features/analysis/AnalysisService";
import type { AnalysisHistoryItem } from "../features/analysis/components/AnalysisList";
import { ResumeService } from "../features/resume/ResumeService";
import type { ResumeSummary } from "../types/resume";
import { getApiErrorMessage } from "../utils/apiError";
import { formatDate } from "../utils/format";

function MetricCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <Card className="transition-colors hover:border-slate-300">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex size-11 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
          <Icon aria-hidden="true" size={22} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm text-slate-600">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function InlineEmpty({ description, title }: { description: string; title: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
      <Inbox aria-hidden="true" className="mx-auto text-slate-400" size={24} />
      <h3 className="mt-3 text-sm font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div>
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="flex items-center gap-4 p-5">
              <Skeleton className="size-11 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-7 w-12" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, cardIndex) => (
          <Card key={cardIndex}>
            <CardHeader>
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 5 }).map((__, rowIndex) => (
                <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-3" key={rowIndex}>
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48 max-w-full" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const [analyses, setAnalyses] = useState<AnalysisHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resumes, setResumes] = useState<ResumeSummary[]>([]);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const resumeResponse = await ResumeService.listResumes();
      const resumeList = resumeResponse.data.resumes;
      const historyResponses = await Promise.all(
        resumeList.map(async (resume) => {
          const response = await AnalysisService.getResumeAnalysisHistory(resume.resumeId);

          return response.data.analyses.map((analysis) => ({
            ...analysis,
            resumeFileName: resume.fileName,
          }));
        }),
      );

      setResumes(resumeList);
      setAnalyses(historyResponses.flat().sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)));
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const averageScore = useMemo(() => {
    const completedScores = analyses
      .map((analysis) => analysis.overallScore)
      .filter((score): score is number => typeof score === "number");

    if (!completedScores.length) {
      return "--";
    }

    const scoreTotal = completedScores.reduce((total, score) => total + score, 0);

    return Math.round(scoreTotal / completedScores.length).toString();
  }, [analyses]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadDashboard} title="Unable to load dashboard" />;
  }

  return (
    <div>
      <PageHeader
        actions={
          <LinkButton to="/app/resumes">
            <Upload aria-hidden="true" size={18} />
            Upload Resume
          </LinkButton>
        }
        description="A quick view of uploaded resumes, processing status, and generated feedback."
        title="Dashboard"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={FileText} label="Total Resumes" value={String(resumes.length)} />
        <MetricCard
          icon={ListChecks}
          label="Processed Resumes"
          value={String(resumes.filter((resume) => resume.status === "processed").length)}
        />
        <MetricCard icon={BarChart3} label="Analyses" value={String(analyses.length)} />
        <MetricCard icon={BarChart3} label="Average Score" value={averageScore} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Resumes</CardTitle>
            <CardDescription>Latest uploaded resumes in your workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            {resumes.length ? (
              <div className="space-y-3">
                {resumes.slice(0, 5).map((resume) => (
                  <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-3 py-3" key={resume.resumeId}>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-950">{resume.fileName}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatDate(resume.createdAt)}</p>
                    </div>
                    <StatusBadge status={resume.status} />
                  </div>
                ))}
              </div>
            ) : (
              <InlineEmpty description="Upload a PDF resume to start using InterCoach." title="No resumes yet" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Analyses</CardTitle>
            <CardDescription>Your latest generated resume analyses.</CardDescription>
          </CardHeader>
          <CardContent>
            {analyses.length ? (
              <div className="space-y-3">
                {analyses.slice(0, 5).map((analysis) => (
                  <LinkButton
                    className="h-auto w-full justify-between rounded-lg border border-slate-200 bg-white px-3 py-3 text-left text-slate-950 shadow-none hover:border-slate-300 hover:bg-slate-50"
                    key={analysis.analysisId}
                    to={`/app/analysis/${analysis.analysisId}`}
                    variant="ghost"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-slate-950">
                        {analysis.resumeFileName ?? "Resume analysis"}
                      </span>
                      <span className="mt-1 block text-xs font-normal text-slate-500">{formatDate(analysis.createdAt)}</span>
                    </span>
                    <span className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                      {typeof analysis.overallScore === "number" ? analysis.overallScore : "--"}
                      <ArrowUpRight aria-hidden="true" size={15} />
                    </span>
                  </LinkButton>
                ))}
              </div>
            ) : (
              <InlineEmpty description="Create an analysis from a processed resume to see results here." title="No analyses yet" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
