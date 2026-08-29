import { apiClient } from "../../api/client";
import type { ApiSuccess } from "../../types/api";
import type { JobDescriptionDetail, JobDescriptionSummary } from "../../types/jobDescription";

interface JobDescriptionListResponse {
  jobDescriptions: JobDescriptionSummary[];
}

interface JobDescriptionDetailResponse {
  jobDescription: JobDescriptionDetail;
}

interface DeleteJobDescriptionResponse {
  jobDescriptionId: string;
}

export interface CreateJobDescriptionInput {
  title: string;
  company?: string;
  rawText: string;
}

export class JobDescriptionService {
  static async listJobDescriptions() {
    const response = await apiClient.get<ApiSuccess<JobDescriptionListResponse>>("/job-descriptions");

    return response.data;
  }

  static async getJobDescription(jobDescriptionId: string) {
    const response = await apiClient.get<ApiSuccess<JobDescriptionDetailResponse>>(
      `/job-descriptions/${jobDescriptionId}`,
    );

    return response.data;
  }

  static async createJobDescription(input: CreateJobDescriptionInput) {
    const response = await apiClient.post<ApiSuccess<JobDescriptionDetailResponse>>(
      "/job-descriptions",
      input,
    );

    return response.data;
  }

  static async deleteJobDescription(jobDescriptionId: string) {
    const response = await apiClient.delete<ApiSuccess<DeleteJobDescriptionResponse>>(
      `/job-descriptions/${jobDescriptionId}`,
    );

    return response.data;
  }
}
