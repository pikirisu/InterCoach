import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  FileText,
  Gauge,
  Inbox,
  LineChart,
  ListChecks,
  Sparkles,
  Target,
  TrendingUp,
  UploadCloud,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ErrorState,
  LinkButton,
  Skeleton,
  StatusBadge,
} from "../components/ui";
import { AnalysisService } from "../features/analysis/AnalysisService";
import type { AnalysisHistoryItem } from "../features/analysis/components/AnalysisList";
import { MatchService } from "../features/match/MatchService";
import { ResumeService } from "../features/resume/ResumeService";
import { useAuth } from "../hooks/useAuth";
import type { ResumeSummary } from "../types/resume";
import { getApiErrorMessage } from "../utils/apiError";
import { formatDate } from "../utils/format";

function KpiCard({
  detail,
  icon: Icon,
  label,
  value,
}: {
  detail: string;
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <Card className="transition duration-200 hover:-translate-y-1 hover:border-slate-700">
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
            <Icon aria-hidden="true" size={20} />
          </div>
          <TrendingUp
            aria-hidden="true"
            className="text-emerald-400"
            size={18}
          />
        </div>
        <p className="mt-5 text-sm font-semibold text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-semibold text-slate-50">{value}</p>
        <p className="mt-2 text-sm leading-6 text-slate-400">{detail}</p>
      </CardContent>
    </Card>
  );
}

function ScoreRing({
  description,
  label,
  score,
}: {
  description: string;
  label: string;
  score: number;
}) {
  return (
    <div className="flex items-center gap-5 rounded-2xl border border-slate-800 bg-slate-800/60 p-5">
      <div
        className="flex size-24 shrink-0 items-center justify-center rounded-full p-2"
        style={{
          background: `conic-gradient(#3b82f6 ${score * 3.6}deg, #1e293b 0deg)`,
        }}
      >
        <div className="flex size-full items-center justify-center rounded-full bg-slate-900 text-2xl font-semibold text-slate-50">
          {score || "--"}
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-50">{label}</p>
        <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
      </div>
    </div>
  );
}

function InlineEmpty({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-800/40 px-4 py-8 text-center">
      <Inbox aria-hidden="true" className="mx-auto text-slate-500" size={24} />
      <h3 className="mt-3 text-sm font-semibold text-slate-50">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
        {description}
      </p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-64 w-full" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton className="h-40 w-full" key={index} />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisHistoryItem[]>([]);
  const [matchScores, setMatchScores] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resumes, setResumes] = useState<ResumeSummary[]>([]);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const resumeResponse = await ResumeService.listResumes();
      const resumeList = resumeResponse.data.resumes;
      const [historyResponses, matchHistoryResponses] = await Promise.all([
        Promise.all(
          resumeList.map(async (resume) => {
            const response = await AnalysisService.getResumeAnalysisHistory(
              resume.resumeId,
            );

            return response.data.analyses.map((analysis) => ({
              ...analysis,
              resumeFileName: resume.fileName,
            }));
          }),
        ),
        Promise.all(
          resumeList.map((resume) =>
            MatchService.getResumeMatchHistory(resume.resumeId),
          ),
        ),
      ]);

      setResumes(resumeList);
      setAnalyses(
        historyResponses
          .flat()
          .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
      );
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
    void loadDashboard();
  }, [loadDashboard]);

  const completedScores = useMemo(
    () =>
      analyses
        .map((analysis) => analysis.overallScore)
        .filter((score): score is number => typeof score === "number"),
    [analyses],
  );
  const averageScore = completedScores.length
    ? Math.round(
        completedScores.reduce((total, score) => total + score, 0) /
          completedScores.length,
      )
    : 0;
  const processedResumes = resumes.filter(
    (resume) => resume.status === "processed",
  ).length;
  const averageMatchScore = matchScores.length
    ? Math.round(
        matchScores.reduce((total, score) => total + score, 0) /
          matchScores.length,
      )
    : 0;
  const scoreTrend = completedScores.slice(0, 7).reverse();
  const activityItems = [
    ...analyses.slice(0, 4).map((analysis) => ({
      date: analysis.createdAt,
      label: analysis.resumeFileName ?? "Resume analysis",
      status: analysis.status,
      type: "Analysis",
    })),
    ...resumes.slice(0, 4).map((resume) => ({
      date: resume.createdAt,
      label: resume.fileName,
      status: resume.status,
      type: "Resume",
    })),
  ]
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
    .slice(0, 6);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={loadDashboard}
        title="Unable to load dashboard"
      />
    );
  }

  return (
    <div className="animate-surface-in space-y-6">
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/40 text-white shadow-[0_24px_90px_rgba(0,0,0,0.4)]">
        <div className="premium-grid grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-sm font-semibold text-blue-100">
              <Sparkles aria-hidden="true" size={16} />
              AI resume workspace
            </div>
            <h1 className="mt-6 max-w-3xl text-3xl font-semibold leading-tight sm:text-5xl">
              Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}.
              Build a stronger resume loop.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              Upload resumes, generate AI analysis, and match against real job
              descriptions to see exactly where you stand.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:w-[360px] lg:grid-cols-1">
            <LinkButton
              className="justify-between"
              to="/app/upload"
              variant="inverseSubtle"
            >
              <span className="flex items-center gap-2">
                <UploadCloud aria-hidden="true" size={17} /> Upload resume
              </span>
              <ArrowRight aria-hidden="true" size={16} />
            </LinkButton>
            <LinkButton
              className="justify-between"
              to="/app/analysis"
              variant="inverseSubtle"
            >
              <span className="flex items-center gap-2">
                <BarChart3 aria-hidden="true" size={17} /> Review analysis
              </span>
              <ArrowRight aria-hidden="true" size={16} />
            </LinkButton>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          detail="Documents stored in your workspace."
          icon={FileText}
          label="Total resumes"
          value={String(resumes.length)}
        />
        <KpiCard
          detail="Ready for AI analysis."
          icon={ListChecks}
          label="Processed"
          value={String(processedResumes)}
        />
        <KpiCard
          detail="Generated reports across resumes."
          icon={BarChart3}
          label="Analyses"
          value={String(analyses.length)}
        />
        <KpiCard
          detail="Average completed report score."
          icon={Gauge}
          label="Average score"
          value={completedScores.length ? String(averageScore) : "--"}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                <LineChart aria-hidden="true" size={19} />
              </div>
              <div>
                <CardTitle>Recent analysis scores</CardTitle>
                <CardDescription>
                  Last 7 completed analyses, oldest to newest.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {scoreTrend.length ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-5">
                <div className="flex gap-4">
                  <div className="flex h-40 w-7 shrink-0 flex-col justify-between text-right text-[10px] font-semibold text-slate-600">
                    <span>100</span>
                    <span>50</span>
                    <span>0</span>
                  </div>

                  <div className="relative h-40 flex-1">
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 flex flex-col justify-between"
                    >
                      <span className="h-px w-full bg-slate-800" />
                      <span className="h-px w-full bg-slate-800" />
                      <span className="h-px w-full bg-slate-800" />
                    </div>

                    {/* Fixed 24px columns anchored to the baseline: the bars keep
                        their size instead of stretching to fill the card. */}
                    <div className="relative flex h-full items-end gap-4">
                      {scoreTrend.map((score, index) => (
                        <div
                          className="w-6 rounded-t bg-blue-500"
                          key={index}
                          style={{ height: `${score}%`, minHeight: 2 }}
                          title={`Score ${score} of 100`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex gap-4 pl-11">
                  {scoreTrend.map((score, index) => (
                    <span
                      className="w-6 text-center text-[11px] font-semibold text-slate-500"
                      key={index}
                    >
                      {score}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <InlineEmpty
                description="Complete an analysis to see your recent scores here."
                title="No completed analyses yet"
              />
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job description match</CardTitle>
              <CardDescription>
                Average score across your completed matches.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {matchScores.length ? (
                <ScoreRing
                  description="Average across completed job description matches."
                  label="Average match score"
                  score={averageMatchScore}
                />
              ) : (
                <InlineEmpty
                  description="Save a job description and match it against a resume to see your fit score here."
                  title="No matches yet"
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
              <CardDescription>
                Jump into common resume workflows.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {[
                {
                  icon: UploadCloud,
                  label: "Upload resume",
                  to: "/app/upload",
                },
                { icon: FileText, label: "Open library", to: "/app/resumes" },
                {
                  icon: BarChart3,
                  label: "Analysis history",
                  to: "/app/analysis",
                },
                {
                  icon: Target,
                  label: "Job descriptions",
                  to: "/app/job-descriptions",
                },
              ].map((action) => {
                const Icon = action.icon;

                return (
                  <LinkButton
                    className="justify-between"
                    key={action.to}
                    to={action.to}
                    variant="secondary"
                  >
                    <span className="flex items-center gap-2">
                      <Icon aria-hidden="true" size={16} /> {action.label}
                    </span>
                    <ArrowRight aria-hidden="true" size={15} />
                  </LinkButton>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Activity timeline</CardTitle>
            <CardDescription>
              Latest resume and analysis events.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activityItems.length ? (
              <div className="space-y-4">
                {activityItems.map((item) => (
                  <div
                    className="flex gap-3"
                    key={`${item.type}-${item.date}-${item.label}`}
                  >
                    <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-400">
                      <Clock3 aria-hidden="true" size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-slate-50">
                          {item.label}
                        </p>
                        <StatusBadge status={item.status} />
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.type} on {formatDate(item.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <InlineEmpty
                description="Upload your first resume to start building a timeline."
                title="No activity yet"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent resumes</CardTitle>
            <CardDescription>
              Latest documents in your workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resumes.length ? (
              <div className="space-y-3">
                {resumes.slice(0, 5).map((resume) => (
                  <LinkButton
                    className="h-auto w-full justify-between rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-left text-slate-50 shadow-none hover:border-slate-700 hover:bg-slate-800/60"
                    key={resume.resumeId}
                    to={`/app/resumes/${resume.resumeId}`}
                    variant="ghost"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-slate-50">
                        {resume.fileName}
                      </span>
                      <span className="mt-1 block text-xs font-normal text-slate-500">
                        {formatDate(resume.createdAt)}
                      </span>
                    </span>
                    <StatusBadge status={resume.status} />
                  </LinkButton>
                ))}
              </div>
            ) : (
              <InlineEmpty
                description="Upload a PDF resume to start using InterCoach."
                title="No resumes yet"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent analyses</CardTitle>
            <CardDescription>
              Your latest AI-generated feedback reports.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analyses.length ? (
              <div className="space-y-3">
                {analyses.slice(0, 5).map((analysis) => (
                  <LinkButton
                    className="h-auto w-full justify-between rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-left text-slate-50 shadow-none hover:border-slate-700 hover:bg-slate-800/60"
                    key={analysis.analysisId}
                    to={`/app/analysis/${analysis.analysisId}`}
                    variant="ghost"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-slate-50">
                        {analysis.resumeFileName ?? "Resume analysis"}
                      </span>
                      <span className="mt-1 block text-xs font-normal text-slate-500">
                        {formatDate(analysis.createdAt)}
                      </span>
                    </span>
                    <span className="flex items-center gap-2 text-sm font-semibold text-slate-50">
                      {typeof analysis.overallScore === "number"
                        ? analysis.overallScore
                        : "--"}
                      <CheckCircle2
                        aria-hidden="true"
                        className="text-emerald-400"
                        size={16}
                      />
                    </span>
                  </LinkButton>
                ))}
              </div>
            ) : (
              <InlineEmpty
                description="Create an analysis from a processed resume to see reports here."
                title="No analyses yet"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
