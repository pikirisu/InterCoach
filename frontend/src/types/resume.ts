export type ResumeStatus = "uploaded" | "processing" | "processed" | "failed";

export interface ResumeSummary {
  resumeId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  status: ResumeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeDetail extends ResumeSummary {
  mimeType: string;
  extractedText: string;
}
