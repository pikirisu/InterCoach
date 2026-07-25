import { apiClient } from "../../api/client";
import type { ApiSuccess } from "../../types/api";
import type { AnalysisRecord } from "../../types/analysis";

interface AnalysisResponse {
  analysis: AnalysisRecord;
}

interface AnalysisHistoryResponse {
  analyses: AnalysisRecord[];
}

export class AnalysisService {
  static async createAnalysis(resumeId: string) {
    const response = await apiClient.post<ApiSuccess<AnalysisResponse>>(`/analysis/resume/${resumeId}`);

    return response.data;
  }

  static async getAnalysis(analysisId: string) {
    const response = await apiClient.get<ApiSuccess<AnalysisResponse>>(`/analysis/${analysisId}`);

    return response.data;
  }

  static async getResumeAnalysisHistory(resumeId: string) {
    const response = await apiClient.get<ApiSuccess<AnalysisHistoryResponse>>(`/analysis/resume/${resumeId}`);

    return response.data;
  }
}
