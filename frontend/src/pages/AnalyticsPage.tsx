import { Activity, BarChart3, FileText, Gauge, Inbox, Target } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { PageHeader } from "../components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, ErrorState, LinkButton, Skeleton } from "../components/ui";
import { AnalysisService } from "../features/analysis/AnalysisService";
import type { AnalysisHistoryItem } from "../features/analysis/components/AnalysisList";
import { MatchService } from "../features/match/MatchService";
import { ResumeService } from "../features/resume/ResumeService";
import type { ResumeSummary } from "../types/resume";
import { getApiErrorMessage } from "../utils/apiError";

function AnalyticsSkeleton() {
  return (
    <div>
      <div className="mb-8 space-y-3">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => <Skeleton className="h-32 w-full" key={index} />)}
      </div>
      <div className="mt-6">
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, detail }: { icon: typeof BarChart3; label: string; value: string; detail: string }) {
  return (
    <Card className="transition duration-200 hover:-translate-y-1 hover:border-slate-700">
      <CardContent className="p-5">
        <div className="flex size-11 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
          <Icon aria-hidden="true" size={20} />
        </div>
        <p className="mt-5 text-sm font-semibold text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-semibold text-slate-50">{value}</p>
        <p className="mt-2 text-sm leading-6 text-slate-400">{detail}</p>
      </CardContent>
    </Card>
  );
}

function InlineEmpty({ description, title }: { description: string; title: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-800/40 px-4 py-8 text-center">
      <Inbox aria-hidden="true" className="mx-auto text-slate-500" size={24} />
      <h3 className="mt-3 text-sm font-semibold text-slate-50">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">{description}</p>
    </div>
  );
}

export function AnalyticsPage() {
  const [analyses, setAnalyses] = useState<AnalysisHistoryItem[]>([]);
  const [matchScores, setMatchScores] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resumes, setResumes] = useState<ResumeSummary[]>([]);

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const resumeResponse = await ResumeService.listResumes();
      const resumeList = resumeResponse.data.resumes;
      const [historyResponses, matchHistoryResponses] = await Promise.all([
        Promise.all(
          resumeList.map(async (resume) => {
            const response = await AnalysisService.getResumeAnalysisHistory(resume.resumeId);

            return response.data.analyses.map((analysis) => ({ ...analysis, resumeFileName: resume.fileName }));
          }),
        ),
        Promise.all(resumeList.map((resume) => MatchService.getResumeMatchHistory(resume.resumeId))),
      ]);

      setResumes(resumeList);
      setAnalyses(historyResponses.flat().sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)));
      setMatchScores(
        matchHistoryResponses
          .flatMap((response) => response.data.matches)
          .map((match) => match.matchScore)
          .filter((score): score is number => typeof score === "number"),
      );
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  const completedScores = useMemo(
    () => analyses.map((analysis) => analysis.overallScore).filter((score): score is number => typeof score === "number"),
    [analyses],
  );
  const averageScore = completedScores.length ? Math.round(completedScores.reduce((total, score) => total + score, 0) / completedScores.length) : 0;
  const averageMatchScore = matchScores.length ? Math.round(matchScores.reduce((total, score) => total + score, 0) / matchScores.length) : 0;
  const processedResumes = resumes.filter((resume) => resume.status === "processed").length;
  const scoreBands = [
    { label: "90+", value: completedScores.filter((score) => score >= 90).length },
    { label: "75-89", value: completedScores.filter((score) => score >= 75 && score < 90).length },
    { label: "60-74", value: completedScores.filter((score) => score >= 60 && score < 75).length },
    { label: "<60", value: completedScores.filter((score) => score < 60).length },
  ];
  const maxBand = Math.max(1, ...scoreBands.map((band) => band.value));

  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadAnalytics} title="Unable to load analytics" />;
  }

  return (
    <div className="animate-surface-in">
      <PageHeader
        actions={<LinkButton to="/app/upload">Upload resume</LinkButton>}
        description="Track resume analysis coverage and job description match performance across your workspace."
        eyebrow="Analytics"
        title="Performance Analytics"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={FileText} label="Resume library" value={String(resumes.length)} detail={`${processedResumes} processed and ready for analysis.`} />
        <MetricCard icon={BarChart3} label="Analysis reports" value={String(analyses.length)} detail="Generated AI feedback snapshots." />
        <MetricCard icon={Gauge} label="Average score" value={completedScores.length ? `${averageScore}` : "--"} detail="Across completed analyses." />
        <MetricCard icon={Target} label="Average match score" value={matchScores.length ? `${averageMatchScore}` : "--"} detail="Across completed job description matches." />
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                <Activity aria-hidden="true" size={19} />
              </div>
              <div>
                <CardTitle>Score distribution</CardTitle>
                <CardDescription>Where your analyses cluster.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {completedScores.length ? (
              scoreBands.map((band) => (
                <div key={band.label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-300">{band.label}</span>
                    <span className="text-slate-500">{band.value}</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-800">
                    <div className="h-3 rounded-full bg-blue-500" style={{ width: `${(band.value / maxBand) * 100}%` }} />
                  </div>
                </div>
              ))
            ) : (
              <InlineEmpty description="Complete an analysis to see how your scores are distributed." title="No completed analyses yet" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
