import { BarChart3, Eye, FileText, Trash2 } from "lucide-react";

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, LinkButton, StatusBadge } from "../../../components/ui";
import type { ResumeSummary } from "../../../types/resume";
import { formatDate, formatFileSize } from "../../../utils/format";

interface ResumeListProps {
  analyzingResumeId: string | null;
  deletingResumeId: string | null;
  onAnalyze: (resume: ResumeSummary) => void;
  onDelete: (resume: ResumeSummary) => void;
  resumes: ResumeSummary[];
}

export function ResumeList({ analyzingResumeId, deletingResumeId, onAnalyze, onDelete, resumes }: ResumeListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Uploaded Resumes</CardTitle>
        <CardDescription>{resumes.length} resume{resumes.length === 1 ? "" : "s"} in this workspace.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="hidden grid-cols-[1.5fr_120px_120px_170px_220px] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium uppercase text-slate-500 lg:grid">
            <span>Resume</span>
            <span>Status</span>
            <span>Size</span>
            <span>Uploaded</span>
            <span className="text-right">Actions</span>
          </div>

          <div className="divide-y divide-slate-200">
            {resumes.map((resume) => {
              const isProcessed = resume.status === "processed";
              const isAnalyzing = analyzingResumeId === resume.resumeId;
              const isDeleting = deletingResumeId === resume.resumeId;

              return (
                <div
                  className="grid gap-4 px-4 py-4 transition-colors hover:bg-slate-50/70 lg:grid-cols-[1.5fr_120px_120px_170px_220px] lg:items-center lg:gap-4"
                  key={resume.resumeId}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="hidden size-9 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 sm:flex">
                      <FileText aria-hidden="true" size={17} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-950">{resume.fileName}</p>
                      <p className="mt-1 truncate text-xs text-slate-500">{resume.filePath}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 lg:block">
                    <span className="text-xs font-medium uppercase text-slate-500 lg:hidden">Status</span>
                    <StatusBadge status={resume.status} />
                  </div>

                  <div className="flex items-center justify-between gap-3 text-sm text-slate-600 lg:block">
                    <span className="text-xs font-medium uppercase text-slate-500 lg:hidden">Size</span>
                    {formatFileSize(resume.fileSize)}
                  </div>
                  <div className="flex items-center justify-between gap-3 text-sm text-slate-600 lg:block">
                    <span className="text-xs font-medium uppercase text-slate-500 lg:hidden">Uploaded</span>
                    {formatDate(resume.createdAt)}
                  </div>

                  <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
                    <Button
                      disabled={!isProcessed || Boolean(analyzingResumeId)}
                      isLoading={isAnalyzing}
                      leftIcon={<BarChart3 aria-hidden="true" size={16} />}
                      onClick={() => onAnalyze(resume)}
                      size="sm"
                    >
                      Analyze
                    </Button>
                    <LinkButton size="sm" to={`/app/analysis?resumeId=${resume.resumeId}`} variant="secondary">
                      <Eye aria-hidden="true" size={16} />
                      History
                    </LinkButton>
                    <Button
                      disabled={Boolean(deletingResumeId)}
                      isLoading={isDeleting}
                      leftIcon={<Trash2 aria-hidden="true" size={16} />}
                      onClick={() => onDelete(resume)}
                      size="sm"
                      variant="danger"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
