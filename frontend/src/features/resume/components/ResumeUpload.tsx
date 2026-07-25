import { FileText, Upload, UploadCloud } from "lucide-react";
import { useId, useRef, useState, type ChangeEvent } from "react";

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, useToast } from "../../../components/ui";
import type { ResumeDetail } from "../../../types/resume";
import { getApiErrorMessage } from "../../../utils/apiError";
import { formatFileSize } from "../../../utils/format";
import { ResumeService } from "../ResumeService";

interface ResumeUploadProps {
  onUploaded: (resume: ResumeDetail, message: string) => void;
}

export function ResumeUpload({ onUploaded }: ResumeUploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const inputId = useId();
  const { showToast, updateToast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    setError(null);
    setFile(selectedFile);
  };

  const handleSubmit = async () => {
    if (!file) {
      const message = "Choose a PDF resume before uploading.";
      setError(message);
      showToast({ description: message, title: "Resume required", tone: "error" });
      return;
    }

    if (file.type && file.type !== "application/pdf") {
      const message = "Only PDF resumes can be uploaded.";
      setError(message);
      showToast({ description: message, title: "Unsupported file", tone: "error" });
      return;
    }

    setIsUploading(true);
    setError(null);
    const toastId = showToast({ description: file.name, duration: 0, title: "Uploading resume", tone: "loading" });

    try {
      const response = await ResumeService.uploadResume(file);
      onUploaded(response.data.resume, response.message);
      updateToast(toastId, { description: response.message, title: "Resume uploaded", tone: "success" });
      setFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (uploadError) {
      const message = getApiErrorMessage(uploadError);
      setError(message);
      updateToast(toastId, { description: message, title: "Upload failed", tone: "error" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
            <UploadCloud aria-hidden="true" size={20} />
          </div>
          <div>
            <CardTitle className="text-lg">Upload Resume</CardTitle>
            <CardDescription>Upload a PDF resume to extract text and prepare it for analysis.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </div>
        ) : null}

        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <label
            className="group flex min-h-20 cursor-pointer items-center gap-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 transition hover:border-slate-400 hover:bg-white"
            htmlFor={inputId}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm shadow-slate-950/[0.02]">
              <FileText aria-hidden="true" size={19} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-slate-950">
                {file ? file.name : "Select PDF resume"}
              </span>
              <span className="mt-1 block text-sm text-slate-500">
                {file ? `${formatFileSize(file.size)} selected` : "PDF files only"}
              </span>
            </span>
          </label>
          <input
            accept="application/pdf,.pdf"
            className="sr-only"
            id={inputId}
            onChange={handleFileChange}
            ref={fileInputRef}
            type="file"
          />
          <Button
            className="w-full lg:w-auto"
            isLoading={isUploading}
            leftIcon={<Upload aria-hidden="true" size={18} />}
            onClick={handleSubmit}
          >
            {isUploading ? "Uploading" : "Upload resume"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

