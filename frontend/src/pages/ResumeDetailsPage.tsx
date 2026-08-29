import { ArrowLeft, BarChart3, Calendar, FileText, HardDrive, History, Sparkles, Target, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { PageHeader } from "../components/layout/PageHeader";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, ErrorState, LinkButton, Skeleton, StatusBadge, useToast } from "../components/ui";
import { AnalysisService } from "../features/analysis/AnalysisService";
import { JobDescriptionService } from "../features/jobDescription/JobDescriptionService";
import { MatchService } from "../features/match/MatchService";
import type { AnalysisRecord } from "../types/analysis";
import type { JobDescriptionSummary } from "../types/jobDescription";
import type { MatchRecord } from "../types/match";
import type { ResumeDetail } from "../types/resume";
import { getApiErrorMessage } from "../utils/apiError";
import { formatDate, formatFileSize } from "../utils/format";
import { ResumeService } from "../features/resume/ResumeService";

function ResumeDetailsSkeleton() {
  return (
    <div>
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-5 w-96 max-w-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-11 w-28" />
          <Skeleton className="h-11 w-32" />
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card><CardContent className="space-y-4 p-6">{Array.from({ length: 5 }).map((_, index) => <Skeleton className="h-16 w-full" key={index} />)}</CardContent></Card>
        <Card><CardContent className="space-y-3 p-6">{Array.from({ length: 8 }).map((_, index) => <Skeleton className="h-4 w-full" key={index} />)}</CardContent></Card>
      </div>
    </div>
  );
}

function DetailTile({ icon: Icon, label, value }: { icon: typeof FileText; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
        <Icon aria-hidden="true" size={16} />
        {label}
      </div>
      <p className="mt-3 break-words text-sm font-semibold text-slate-50">{value}</p>
    </div>
  );
}

export function ResumeDetailsPage() {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const { showToast, updateToast } = useToast();
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [resume, setResume] = useState<ResumeDetail | null>(null);
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [jobDescriptions, setJobDescriptions] = useState<JobDescriptionSummary[]>([]);
  const [selectedJobDescriptionId, setSelectedJobDescriptionId] = useState("");
  const [isMatching, setIsMatching] = useState(false);

  const loadResume = useCallback(async () => {
    if (!resumeId) {
      setError("Resume id is missing.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [resumeResponse, historyResponse, matchHistoryResponse, jobDescriptionsResponse] = await Promise.all([
        ResumeService.getResume(resumeId),
        AnalysisService.getResumeAnalysisHistory(resumeId),
        MatchService.getResumeMatchHistory(resumeId),
        JobDescriptionService.listJobDescriptions(),
      ]);
      setResume(resumeResponse.data.resume);
      setAnalyses(historyResponse.data.analyses.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)));
      setMatches(matchHistoryResponse.data.matches.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)));
      setJobDescriptions(jobDescriptionsResponse.data.jobDescriptions);
      setSelectedJobDescriptionId((current) => current || jobDescriptionsResponse.data.jobDescriptions[0]?.jobDescriptionId || "");
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [resumeId]);

  useEffect(() => {
    void loadResume();
  }, [loadResume]);

  const latestAnalysis = analyses[0];
  const latestMatch = matches[0];
  const extractedPreview = useMemo(() => {
    const text = resume?.extractedText?.trim();

    if (!text) {
      return "Resume text is still being extracted. Once processing completes, the preview will appear here.";
    }

    return text;
  }, [resume?.extractedText]);

  const handleCreateAnalysis = async () => {
    if (!resume) {
      return;
    }

    setIsAnalyzing(true);
    const toastId = showToast({ description: resume.fileName, duration: 0, title: "Analyzing resume", tone: "loading" });

    try {
      const response = await AnalysisService.createAnalysis(resume.resumeId);
      updateToast(toastId, { description: "Opening the generated feedback.", title: "Analysis ready", tone: "success" });
      navigate(`/app/analysis/${response.data.analysis.analysisId}`);
    } catch (analysisError) {
      updateToast(toastId, { description: getApiErrorMessage(analysisError), title: "Analysis failed", tone: "error" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateMatch = async () => {
    if (!resume || !selectedJobDescriptionId) {
      return;
    }

    const jobDescriptionTitle =
      jobDescriptions.find((jobDescription) => jobDescription.jobDescriptionId === selectedJobDescriptionId)?.title ??
      "job description";

    setIsMatching(true);
    const toastId = showToast({ description: jobDescriptionTitle, duration: 0, title: "Matching resume", tone: "loading" });

    try {
      const response = await MatchService.createMatch(resume.resumeId, selectedJobDescriptionId);
      updateToast(toastId, { description: "Opening the match results.", title: "Match ready", tone: "success" });
      navigate(`/app/matches/${response.data.match.matchId}`);
    } catch (matchError) {
      updateToast(toastId, { description: getApiErrorMessage(matchError), title: "Match failed", tone: "error" });
    } finally {
      setIsMatching(false);
    }
  };

  if (isLoading) {
    return <ResumeDetailsSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadResume} title="Unable to load resume" />;
  }

  if (!resume) {
    return <ErrorState message="The requested resume could not be found." title="Resume unavailable" />;
  }

  return (
    <div className="animate-surface-in">
      <PageHeader
        actions={
          <>
            <LinkButton to="/app/resumes" variant="secondary">
              <ArrowLeft aria-hidden="true" size={16} />
              Library
            </LinkButton>
            <Button disabled={resume.status !== "processed"} isLoading={isAnalyzing} leftIcon={<Sparkles aria-hidden="true" size={16} />} onClick={handleCreateAnalysis}>
              Analyze
            </Button>
          </>
        }
        description="Inspect parsed resume text, file health, and all generated analyses for this document."
        eyebrow="Resume details"
        title={resume.fileName}
      />

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>Document health</CardTitle>
                  <CardDescription>File metadata and analysis readiness.</CardDescription>
                </div>
                <StatusBadge status={resume.status} />
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <DetailTile icon={FileText} label="File path" value={resume.filePath} />
              <DetailTile icon={HardDrive} label="File size" value={formatFileSize(resume.fileSize)} />
              <DetailTile icon={Calendar} label="Uploaded" value={formatDate(resume.createdAt)} />
              <DetailTile icon={History} label="Analyses" value={`${analyses.length} report${analyses.length === 1 ? "" : "s"}`} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Latest score</CardTitle>
              <CardDescription>Most recent AI analysis for this resume.</CardDescription>
            </CardHeader>
            <CardContent>
              {latestAnalysis ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">Overall score</p>
                      <p className="mt-2 text-4xl font-semibold text-slate-50">
                        {typeof latestAnalysis.overallScore === "number" ? latestAnalysis.overallScore : "--"}
                      </p>
                    </div>
                    <StatusBadge status={latestAnalysis.status} />
                  </div>
                  <LinkButton className="mt-5 w-full" to={`/app/analysis/${latestAnalysis.analysisId}`} variant="secondary">
                    Open latest analysis
                    <BarChart3 aria-hidden="true" size={16} />
                  </LinkButton>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-800/40 p-6 text-center">
                  <p className="text-sm font-semibold text-slate-50">No analysis yet</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">Generate an AI report when this resume is processed.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Match against a job description</CardTitle>
              <CardDescription>Skill coverage against a saved job posting, computed deterministically.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {jobDescriptions.length ? (
                <>
                  <select
                    className="h-11 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 text-sm text-slate-50 outline-none transition hover:border-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                    onChange={(event) => setSelectedJobDescriptionId(event.target.value)}
                    value={selectedJobDescriptionId}
                  >
                    {jobDescriptions.map((jobDescription) => (
                      <option key={jobDescription.jobDescriptionId} value={jobDescription.jobDescriptionId}>
                        {jobDescription.title}
                        {jobDescription.company ? ` — ${jobDescription.company}` : ""}
                      </option>
                    ))}
                  </select>
                  <Button
                    className="w-full"
                    disabled={resume.status !== "processed"}
                    isLoading={isMatching}
                    leftIcon={<Target aria-hidden="true" size={16} />}
                    onClick={handleCreateMatch}
                  >
                    Run match
                  </Button>
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-800/40 p-6 text-center">
                  <p className="text-sm font-semibold text-slate-50">No job descriptions saved</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">Save a job posting first, then match this resume against it.</p>
                  <LinkButton className="mt-4" to="/app/job-descriptions" variant="secondary">
                    Add a job description
                  </LinkButton>
                </div>
              )}

              {latestMatch ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">Latest match score</p>
                      <p className="mt-2 text-3xl font-semibold text-slate-50">
                        {typeof latestMatch.matchScore === "number" ? latestMatch.matchScore : "--"}
                      </p>
                    </div>
                    <StatusBadge status={latestMatch.status} />
                  </div>
                  <LinkButton className="mt-5 w-full" to={`/app/matches/${latestMatch.matchId}`} variant="secondary">
                    Open latest match
                    <Target aria-hidden="true" size={16} />
                  </LinkButton>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Resume preview</CardTitle>
            <CardDescription>Extracted text from the uploaded PDF.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[720px] overflow-auto rounded-2xl border border-slate-800 bg-slate-800/60 p-5 shadow-inner">
              <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-7 text-slate-300">{extractedPreview}</pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
