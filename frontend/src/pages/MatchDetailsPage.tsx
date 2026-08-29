import { AlertTriangle, ArrowLeft, Bot, CheckCircle2, Lightbulb, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";

import { PageHeader } from "../components/layout/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ErrorState,
  LinkButton,
  MetricTile,
  ResultCard,
  ScoreCircle,
  Skeleton,
  StatusBadge,
} from "../components/ui";
import { JobDescriptionService } from "../features/jobDescription/JobDescriptionService";
import { MatchService } from "../features/match/MatchService";
import type { JobDescriptionDetail } from "../types/jobDescription";
import type { MatchRecord } from "../types/match";
import type { ResumeDetail } from "../types/resume";
import { ResumeService } from "../features/resume/ResumeService";
import { formatDate } from "../utils/format";
import { getApiErrorMessage } from "../utils/apiError";

function SkillChip({ tone, label }: { tone: "matched" | "missing"; label: string }) {
  return (
    <span
      className={
        tone === "matched"
          ? "rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-sm font-semibold text-emerald-400"
          : "rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-sm font-semibold text-amber-400"
      }
    >
      {label}
    </span>
  );
}

function MatchDetailsSkeleton() {
  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-5 w-96 max-w-full" />
        </div>
        <Skeleton className="h-11 w-32" />
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between gap-4">
              <div className="space-y-2"><Skeleton className="h-6 w-44" /><Skeleton className="h-4 w-32" /></div>
              <Skeleton className="h-7 w-20 rounded-full" />
            </div>
          </CardHeader>
          <CardContent><div className="grid gap-4 sm:grid-cols-3">{Array.from({ length: 3 }).map((_, index) => <Skeleton className="h-28 w-full" key={index} />)}</div></CardContent>
        </Card>
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

export function MatchDetailsPage() {
  const { matchId } = useParams();
  const [match, setMatch] = useState<MatchRecord | null>(null);
  const [resume, setResume] = useState<ResumeDetail | null>(null);
  const [jobDescription, setJobDescription] = useState<JobDescriptionDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadMatch = useCallback(async () => {
    if (!matchId) {
      setError("Match id is missing.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await MatchService.getMatch(matchId);
      const nextMatch = response.data.match;
      setMatch(nextMatch);

      try {
        const resumeResponse = await ResumeService.getResume(nextMatch.resumeId);
        setResume(resumeResponse.data.resume);
      } catch {
        setResume(null);
      }

      try {
        const jobDescriptionResponse = await JobDescriptionService.getJobDescription(nextMatch.jobDescriptionId);
        setJobDescription(jobDescriptionResponse.data.jobDescription);
      } catch {
        setJobDescription(null);
      }
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    void loadMatch();
  }, [loadMatch]);

  if (isLoading) {
    return <MatchDetailsSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadMatch} title="Unable to load match" />;
  }

  if (!match) {
    return <ErrorState message="The requested match could not be found." title="Match unavailable" />;
  }

  const matchScore = typeof match.matchScore === "number" ? match.matchScore : 0;

  return (
    <div className="animate-surface-in">
      <PageHeader
        actions={
          resume ? (
            <LinkButton to={`/app/resumes/${resume.resumeId}`} variant="secondary">
              <ArrowLeft aria-hidden="true" size={16} />
              Resume
            </LinkButton>
          ) : null
        }
        description={
          jobDescription
            ? `Skill coverage between ${resume?.fileName ?? "this resume"} and ${jobDescription.title}.`
            : "Skill coverage computed from actual matches against the job description text."
        }
        eyebrow="Job description match"
        title="Match Results"
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>Match overview</CardTitle>
                <CardDescription>Created {formatDate(match.createdAt)} with {match.aiModel || "the configured AI model"}.</CardDescription>
              </div>
              <StatusBadge status={match.status} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
              <ScoreCircle label="Match score" score={matchScore} />
              <div className="grid gap-4 sm:grid-cols-2">
                <MetricTile icon={Bot} label="AI model" value={match.aiModel || "Not available"} />
                <MetricTile icon={TrendingUp} label="Last updated" value={formatDate(match.updatedAt)} />
                <MetricTile icon={CheckCircle2} label="Matched skills" value={String(match.matchedSkills.length)} />
                <MetricTile icon={AlertTriangle} label="Missing skills" value={String(match.missingSkills.length)} />
              </div>
            </div>

            {match.errorMessage ? (
              <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-400" role="alert">
                {match.errorMessage}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Matched skills</CardTitle>
              <CardDescription>Requirements the resume text already covers.</CardDescription>
            </CardHeader>
            <CardContent>
              {match.matchedSkills.length ? (
                <div className="flex flex-wrap gap-2">
                  {match.matchedSkills.map((skill) => (
                    <SkillChip key={skill} label={skill} tone="matched" />
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl border border-dashed border-slate-700 bg-slate-800/40 px-4 py-8 text-center text-sm text-slate-500">
                  No matched skills found.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Missing skills</CardTitle>
              <CardDescription>Requirements not found in the resume text.</CardDescription>
            </CardHeader>
            <CardContent>
              {match.missingSkills.length ? (
                <div className="flex flex-wrap gap-2">
                  {match.missingSkills.map((skill) => (
                    <SkillChip key={skill} label={skill} tone="missing" />
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl border border-dashed border-slate-700 bg-slate-800/40 px-4 py-8 text-center text-sm text-slate-500">
                  No missing skills - full coverage.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <ResultCard
          icon={Lightbulb}
          items={match.recommendations}
          title="Recommendations"
          tone="border-amber-500/20 bg-amber-500/10 text-amber-400"
        />
      </div>
    </div>
  );
}
