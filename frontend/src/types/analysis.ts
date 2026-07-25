export type AnalysisStatus = "processing" | "completed" | "failed";

export interface AnalysisRecord {
  analysisId: string;
  resumeId: string;
  status: AnalysisStatus;
  overallScore?: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  aiModel: string;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}
