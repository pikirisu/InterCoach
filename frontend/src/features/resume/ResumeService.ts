import { apiClient } from "../../api/client";
import type { ApiSuccess } from "../../types/api";
import type { ResumeDetail, ResumeSummary } from "../../types/resume";

interface ResumeListResponse {
  resumes: ResumeSummary[];
}

interface ResumeDetailResponse {
  resume: ResumeDetail;
}

interface DeleteResumeResponse {
  resumeId: string;
}

export class ResumeService {
  static async listResumes() {
    const response = await apiClient.get<ApiSuccess<ResumeListResponse>>("/resumes");

    return response.data;
  }

  static async getResume(resumeId: string) {
    const response = await apiClient.get<ApiSuccess<ResumeDetailResponse>>(`/resumes/${resumeId}`);

    return response.data;
  }

  static async uploadResume(file: File) {
    const formData = new FormData();
    formData.append("resume", file);

    const response = await apiClient.post<ApiSuccess<ResumeDetailResponse>>("/resumes", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  }

  static async deleteResume(resumeId: string) {
    const response = await apiClient.delete<ApiSuccess<DeleteResumeResponse>>(`/resumes/${resumeId}`);

    return response.data;
  }
}
