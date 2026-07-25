import { FileText, UploadCloud } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { PageHeader } from "../components/layout/PageHeader";
import { Button, Card, CardContent, CardHeader, CardTitle, EmptyState, ErrorState, Modal, Skeleton, useToast } from "../components/ui";
import { AnalysisService } from "../features/analysis/AnalysisService";
import { ResumeList } from "../features/resume/components/ResumeList";
import { ResumeUpload } from "../features/resume/components/ResumeUpload";
import { ResumeService } from "../features/resume/ResumeService";
import type { ResumeDetail, ResumeSummary } from "../types/resume";
import { getApiErrorMessage } from "../utils/apiError";

function ResumeListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Uploaded Resumes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <div className="hidden grid-cols-[1.5fr_120px_120px_170px_220px] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 lg:grid">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton className="h-3 w-20" key={index} />
            ))}
          </div>
          <div className="divide-y divide-slate-200">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="grid gap-3 px-4 py-4 lg:grid-cols-[1.5fr_120px_120px_170px_220px] lg:items-center lg:gap-4" key={index}>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48 max-w-full" />
                  <Skeleton className="h-3 w-64 max-w-full" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
                <div className="flex gap-2 lg:justify-end">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ResumesPage() {
  const navigate = useNavigate();
  const { showToast, updateToast } = useToast();
  const [analyzingResumeId, setAnalyzingResumeId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ResumeSummary | null>(null);
  const [deletingResumeId, setDeletingResumeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resumes, setResumes] = useState<ResumeSummary[]>([]);

  const loadResumes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await ResumeService.listResumes();
      setResumes(response.data.resumes);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadResumes();
  }, [loadResumes]);

  const handleUploaded = (resume: ResumeDetail, _message: string) => {
    setResumes((currentResumes) => [resume, ...currentResumes]);
  };

  const handleCreateAnalysis = async (resume: ResumeSummary) => {
    setAnalyzingResumeId(resume.resumeId);
    setError(null);
    const toastId = showToast({ description: resume.fileName, duration: 0, title: "Analyzing resume", tone: "loading" });

    try {
      const response = await AnalysisService.createAnalysis(resume.resumeId);
      updateToast(toastId, {
        description: "Opening the generated feedback.",
        title: "Analysis ready",
        tone: "success",
      });
      navigate(`/app/analysis/${response.data.analysis.analysisId}`);
    } catch (analysisError) {
      const message = getApiErrorMessage(analysisError);
      setError(message);
      updateToast(toastId, { description: message, title: "Analysis failed", tone: "error" });
    } finally {
      setAnalyzingResumeId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setDeletingResumeId(deleteTarget.resumeId);
    setError(null);
    const toastId = showToast({ description: deleteTarget.fileName, duration: 0, title: "Deleting resume", tone: "loading" });

    try {
      const response = await ResumeService.deleteResume(deleteTarget.resumeId);
      setResumes((currentResumes) => currentResumes.filter((resume) => resume.resumeId !== response.data.resumeId));
      updateToast(toastId, { description: response.message, title: "Resume deleted", tone: "success" });
      setDeleteTarget(null);
    } catch (deleteError) {
      const message = getApiErrorMessage(deleteError);
      setError(message);
      updateToast(toastId, { description: message, title: "Delete failed", tone: "error" });
    } finally {
      setDeletingResumeId(null);
    }
  };

  return (
    <div>
      <PageHeader
        description="Upload PDF resumes, review processing status, and generate detailed analysis."
        title="Resumes"
      />

      <div className="space-y-6">
        <ResumeUpload onUploaded={handleUploaded} />

        {error && !isLoading && resumes.length ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <ResumeListSkeleton />
        ) : error && !resumes.length ? (
          <ErrorState message={error} onRetry={loadResumes} title="Unable to load resumes" />
        ) : resumes.length ? (
          <ResumeList
            analyzingResumeId={analyzingResumeId}
            deletingResumeId={deletingResumeId}
            onAnalyze={handleCreateAnalysis}
            onDelete={setDeleteTarget}
            resumes={resumes}
          />
        ) : (
          <EmptyState
            action={
              <Button leftIcon={<UploadCloud aria-hidden="true" size={16} />} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} variant="secondary">
                Upload Resume
              </Button>
            }
            description="Add your first PDF resume to start generating structured feedback."
            icon={FileText}
            title="No resumes uploaded"
          />
        )}
      </div>

      <Modal
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button onClick={() => setDeleteTarget(null)} variant="secondary">
              Cancel
            </Button>
            <Button isLoading={Boolean(deletingResumeId)} onClick={handleDelete} variant="danger">
              Delete Resume
            </Button>
          </div>
        }
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete resume"
      >
        <p className="text-sm leading-6 text-slate-600">
          This will delete <span className="font-medium text-slate-950">{deleteTarget?.fileName}</span> and remove its uploaded file.
        </p>
      </Modal>
    </div>
  );
}
