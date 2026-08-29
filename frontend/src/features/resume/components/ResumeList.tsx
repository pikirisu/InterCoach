import { BarChart3, Eye, FileText, History, Trash2 } from "lucide-react";

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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Resume Library</CardTitle>
            <CardDescription>{resumes.length} resume{resumes.length === 1 ? "" : "s"} organized in this workspace.</CardDescription>
          </div>
          <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">PDF workspace</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="hidden grid-cols-[1.45fr_120px_110px_160px_230px] gap-4 border-b border-slate-800 bg-slate-800/40 px-4 py-3 text-xs font-semibold uppercase text-slate-500 xl:grid">
            <span>Resume</span>
            <span>Status</span>
            <span>Size</span>
            <span>Uploaded</span>
            <span className="text-right">Actions</span>
          </div>

          <div className="divide-y divide-slate-800">
            {resumes.map((resume) => {
              const isProcessed = resume.status === "processed";
              const isAnalyzing = analyzingResumeId === resume.resumeId;
              const isDeleting = deletingResumeId === resume.resumeId;

              return (
                <div
                  className="grid gap-4 px-4 py-4 transition-colors hover:bg-slate-800/40 xl:grid-cols-[1.45fr_120px_110px_160px_230px] xl:items-center xl:gap-4"
                  key={resume.resumeId}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="hidden size-10 shrink-0 items-center justify-center rounded-2xl border border-slate-800 bg-slate-800/60 text-blue-400 sm:flex">
                      <FileText aria-hidden="true" size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-50">{resume.fileName}</p>
                      <p className="mt-1 truncate text-xs text-slate-500">{resume.filePath}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 xl:block">
                    <span className="text-xs font-semibold uppercase text-slate-500 xl:hidden">Status</span>
                    <StatusBadge status={resume.status} />
                  </div>

                  <div className="flex items-center justify-between gap-3 text-sm text-slate-400 xl:block">
                    <span className="text-xs font-semibold uppercase text-slate-500 xl:hidden">Size</span>
                    {formatFileSize(resume.fileSize)}
                  </div>
                  <div className="flex items-center justify-between gap-3 text-sm text-slate-400 xl:block">
                    <span className="text-xs font-semibold uppercase text-slate-500 xl:hidden">Uploaded</span>
                    {formatDate(resume.createdAt)}
                  </div>

                  {/* One filled verb carries the row's main action; the rest are
                      quiet icon controls so four buttons stop competing. */}
                  <div className="flex items-center justify-start gap-1.5 xl:justify-end">
                    <Button
                      disabled={!isProcessed || Boolean(analyzingResumeId)}
                      isLoading={isAnalyzing}
                      leftIcon={<BarChart3 aria-hidden="true" size={16} />}
                      onClick={() => onAnalyze(resume)}
                      size="sm"
                    >
                      Analyze
                    </Button>

                    <span aria-hidden="true" className="mx-1 h-5 w-px bg-slate-800" />

                    <LinkButton
                      aria-label={`View details for ${resume.fileName}`}
                      size="icon"
                      title="Details"
                      to={`/app/resumes/${resume.resumeId}`}
                      variant="ghost"
                    >
                      <Eye aria-hidden="true" size={16} />
                    </LinkButton>
                    <LinkButton
                      aria-label={`View analysis history for ${resume.fileName}`}
                      size="icon"
                      title="Analysis history"
                      to={`/app/analysis?resumeId=${resume.resumeId}`}
                      variant="ghost"
                    >
                      <History aria-hidden="true" size={16} />
                    </LinkButton>
                    <Button
                      aria-label={`Delete ${resume.fileName}`}
                      className="hover:text-red-400"
                      disabled={Boolean(deletingResumeId)}
                      isLoading={isDeleting}
                      onClick={() => onDelete(resume)}
                      size="icon"
                      title="Delete"
                      variant="ghost"
                    >
                      <Trash2 aria-hidden="true" size={16} />
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
