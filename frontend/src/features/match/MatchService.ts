import { apiClient } from "../../api/client";
import type { ApiSuccess } from "../../types/api";
import type { MatchRecord } from "../../types/match";

interface MatchResponse {
  match: MatchRecord;
}

interface MatchHistoryResponse {
  matches: MatchRecord[];
}

export class MatchService {
  static async createMatch(resumeId: string, jobDescriptionId: string) {
    const response = await apiClient.post<ApiSuccess<MatchResponse>>(
      `/matches/resume/${resumeId}/job-description/${jobDescriptionId}`,
    );

    return response.data;
  }

  static async getMatch(matchId: string) {
    const response = await apiClient.get<ApiSuccess<MatchResponse>>(`/matches/${matchId}`);

    return response.data;
  }

  static async getResumeMatchHistory(resumeId: string) {
    const response = await apiClient.get<ApiSuccess<MatchHistoryResponse>>(`/matches/resume/${resumeId}`);

    return response.data;
  }
}
