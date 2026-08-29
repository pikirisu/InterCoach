import { ArrowLeft, Download } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";

import { PageHeader } from "../components/layout/PageHeader";
import { Button, Card, CardContent, CardHeader, ErrorState, LinkButton, Skeleton } from "../components/ui";
import { AnalysisService } from "../features/analysis/AnalysisService";
import { AnalysisDetails } from "../features/analysis/components/AnalysisDetails";
import { ResumeService } from "../features/resume/ResumeService";
import type { AnalysisRecord } from "../types/analysis";
import type { ResumeDetail } from "../types/resume";
import { getApiErrorMessage } from "../utils/apiError";

function AnalysisDetailsSkeleton() {
  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-5 w-96 max-w-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-11 w-32" />
          <Skeleton className="h-11 w-32" />
        </div>
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
        <div className="grid gap-6 xl:grid-cols-2">
          <Skeleton className="h-[520px] w-full" />
          <Skeleton className="h-[520px] w-full" />
        </div>
      </div>
    </div>
  );
}

export function AnalysisDetailsPage() {
  const { analysisId } = useParams();
  const [analysis, setAnalysis] = useState<AnalysisRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resume, setResume] = useState<ResumeDetail | null>(null);

  const loadAnalysis = useCallback(async () => {
    if (!analysisId) {
      setError("Analysis id is missing.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await AnalysisService.getAnalysis(analysisId);
      const nextAnalysis = response.data.analysis;
      setAnalysis(nextAnalysis);

      try {
        const resumeResponse = await ResumeService.getResume(nextAnalysis.resumeId);
        setResume(resumeResponse.data.resume);
      } catch {
        setResume(null);
      }
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [analysisId]);

  useEffect(() => {
    void loadAnalysis();
  }, [loadAnalysis]);

  if (isLoading) {
    return <AnalysisDetailsSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadAnalysis} title="Unable to load analysis" />;
  }

  if (!analysis) {
    return <ErrorState message="The requested analysis could not be found." title="Analysis unavailable" />;
  }

  return (
    <div className="animate-surface-in">
      <PageHeader
        actions={
          <>
            <LinkButton to="/app/analysis" variant="secondary">
              <ArrowLeft aria-hidden="true" size={16} />
              History
            </LinkButton>
            <Button leftIcon={<Download aria-hidden="true" size={16} />} onClick={() => window.print()} variant="secondary">
              Export PDF
            </Button>
          </>
        }
        description="Detailed strengths, gaps, and recommendations generated from your resume."
        eyebrow="AI analysis"
        title="Resume Analysis"
      />
      <AnalysisDetails analysis={analysis} resume={resume} />
    </div>
  );
}
