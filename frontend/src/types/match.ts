export type MatchStatus = "processing" | "completed" | "failed";

export interface MatchRecord {
  matchId: string;
  resumeId: string;
  jobDescriptionId: string;
  status: MatchStatus;
  matchScore?: number;
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string[];
  aiModel: string;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}
