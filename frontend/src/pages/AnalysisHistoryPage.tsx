import { FileSearch, ListPlus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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
      <div className="mb-7 space-y-3">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-44" />
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <div className="hidden grid-cols-[1.3fr_120px_120px_170px_110px] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 lg:grid">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton className="h-3 w-20" key={index} />
              ))}
            </div>
            <div className="divide-y divide-slate-200">
              {Array.from({ length: 5 }).map((_, index) => (
                <div className="grid gap-4 px-4 py-4 lg:grid-cols-[1.3fr_120px_120px_170px_110px] lg:items-center" key={index}>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48 max-w-full" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-9 w-20 lg:ml-auto" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
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

  if (isLoading) {
    return <AnalysisHistorySkeleton />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadHistory} title="Unable to load analysis history" />;
  }

  return (
    <div>
      <PageHeader
        actions={resumeId ? <LinkButton to="/app/analysis" variant="secondary">View All</LinkButton> : null}
        description="Review generated resume analyses and open detailed feedback."
        title="Analysis History"
      />

      {analyses.length ? (
        <AnalysisList analyses={analyses} />
      ) : (
        <EmptyState
          action={
            <LinkButton to="/app/resumes">
              <ListPlus aria-hidden="true" size={16} />
              Go to Resumes
            </LinkButton>
          }
          description="Create an analysis from a processed resume to build your history."
          icon={FileSearch}
          title="No analyses found"
        />
      )}
    </div>
  );
}
