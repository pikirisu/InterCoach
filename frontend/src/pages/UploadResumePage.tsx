import { ArrowRight, CheckCircle2, FileCheck2, FileText, History, ShieldCheck, UploadCloud } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "../components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, LinkButton, StatusBadge } from "../components/ui";
import { ResumeUpload } from "../features/resume/components/ResumeUpload";
import type { ResumeDetail } from "../types/resume";
import { formatDate, formatFileSize } from "../utils/format";

const checklist = [
  "PDF parsing and text extraction",
  "Resume normalization for AI analysis",
  "AI-ready resume snapshot",
];

export function UploadResumePage() {
  const [uploadedResume, setUploadedResume] = useState<ResumeDetail | null>(null);

  return (
    <div className="animate-surface-in">
      <PageHeader
        actions={
          <LinkButton to="/app/resumes" variant="secondary">
            <History aria-hidden="true" size={16} />
            View library
          </LinkButton>
        }
        description="Add a resume to your workspace and prepare it for AI analysis in a focused upload flow."
        eyebrow="Upload"
        title="Upload Resume"
      />

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <ResumeUpload onUploaded={(resume) => setUploadedResume(resume)} />

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                  <ShieldCheck aria-hidden="true" size={20} />
                </div>
                <div>
                  <CardTitle>Upload pipeline</CardTitle>
                  <CardDescription>Every resume is normalized before an analysis is generated.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {checklist.map((item) => (
                <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-800/60 px-4 py-3" key={item}>
                  <CheckCircle2 aria-hidden="true" className="text-emerald-400" size={18} />
                  <span className="text-sm font-medium text-slate-300">{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {uploadedResume ? (
            <Card className="border-blue-500/20 bg-blue-500/5">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-blue-500 text-white">
                    <FileCheck2 aria-hidden="true" size={20} />
                  </div>
                  <div>
                    <CardTitle>Resume ready</CardTitle>
                    <CardDescription>{uploadedResume.fileName}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 text-sm sm:grid-cols-3 xl:grid-cols-1">
                  <div className="rounded-2xl border border-blue-500/20 bg-slate-900 p-3">
                    <p className="text-xs font-semibold uppercase text-slate-500">Status</p>
                    <div className="mt-2"><StatusBadge status={uploadedResume.status} /></div>
                  </div>
                  <div className="rounded-2xl border border-blue-500/20 bg-slate-900 p-3">
                    <p className="text-xs font-semibold uppercase text-slate-500">Size</p>
                    <p className="mt-2 font-semibold text-slate-50">{formatFileSize(uploadedResume.fileSize)}</p>
                  </div>
                  <div className="rounded-2xl border border-blue-500/20 bg-slate-900 p-3">
                    <p className="text-xs font-semibold uppercase text-slate-500">Uploaded</p>
                    <p className="mt-2 font-semibold text-slate-50">{formatDate(uploadedResume.createdAt)}</p>
                  </div>
                </div>
                <LinkButton className="mt-5 w-full" to={`/app/resumes/${uploadedResume.resumeId}`}>
                  Open resume details
                  <ArrowRight aria-hidden="true" size={16} />
                </LinkButton>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-start gap-3 p-5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-slate-800 bg-slate-800/60 text-slate-400">
                  <FileText aria-hidden="true" size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-50">Supported format</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">Upload a PDF resume up to your API limit. Text extraction happens automatically after upload.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
