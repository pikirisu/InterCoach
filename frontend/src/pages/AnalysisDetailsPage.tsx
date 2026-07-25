import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";

import { PageHeader } from "../components/layout/PageHeader";
import { Card, CardContent, CardHeader, ErrorState, LinkButton, Skeleton } from "../components/ui";
import { AnalysisService } from "../features/analysis/AnalysisService";
import { AnalysisDetails } from "../features/analysis/components/AnalysisDetails";
import type { AnalysisRecord } from "../types/analysis";
import { getApiErrorMessage } from "../utils/apiError";

function AnalysisDetailsSkeleton() {
  return (
    <div>
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-6 w-44" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4" key={index}>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-3 h-8 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-6 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, cardIndex) => (
            <Card key={cardIndex}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent className="space-y-2">
                {Array.from({ length: 4 }).map((__, rowIndex) => (
                  <Skeleton className="h-10 w-full" key={rowIndex} />
                ))}
              </CardContent>
            </Card>
          ))}
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
      setAnalysis(response.data.analysis);
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
    <div>
      <PageHeader
        actions={
          <LinkButton to="/app/analysis" variant="secondary">
            <ArrowLeft aria-hidden="true" size={16} />
            Back to History
          </LinkButton>
        }
        description="Detailed strengths, gaps, and recommendations generated from your resume."
        title="Analysis"
      />
      <AnalysisDetails analysis={analysis} />
    </div>
  );
}
