import { FileText, Upload, UploadCloud } from "lucide-react";
import { useId, useRef, useState, type ChangeEvent, type DragEvent } from "react";

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
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const setSelectedFile = (selectedFile: File | null) => {
    setError(null);
    setFile(selectedFile);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files?.[0] ?? null);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    setSelectedFile(event.dataTransfer.files?.[0] ?? null);
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
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
            <UploadCloud aria-hidden="true" size={21} />
          </div>
          <div>
            <CardTitle>Upload Resume</CardTitle>
            <CardDescription>Drop in a PDF resume and InterCoach will prepare it for AI analysis.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400" role="alert">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <label
            className={[
              "group flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-8 text-center transition duration-200",
              isDragging ? "border-blue-400 bg-blue-500/10" : "border-slate-700 bg-slate-800/40 hover:border-blue-500/50 hover:bg-slate-800/60",
            ].join(" ")}
            htmlFor={inputId}
            onDragLeave={() => setIsDragging(false)}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDrop={handleDrop}
          >
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 text-blue-400">
              <FileText aria-hidden="true" size={24} />
            </span>
            <span className="mt-5 min-w-0">
              <span className="block max-w-full truncate text-base font-semibold text-slate-50">
                {file ? file.name : "Drop your PDF resume here"}
              </span>
              <span className="mt-2 block text-sm text-slate-500">
                {file ? `${formatFileSize(file.size)} selected` : "or click to browse files"}
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
          <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-4 lg:w-64">
            <p className="text-sm font-semibold text-slate-50">Ready when you are</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">PDF files are parsed into text before analysis, so reports can cite structure and content gaps.</p>
            <Button
              className="mt-5 w-full"
              isLoading={isUploading}
              leftIcon={<Upload aria-hidden="true" size={18} />}
              onClick={handleSubmit}
            >
              {isUploading ? "Uploading" : "Upload resume"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
