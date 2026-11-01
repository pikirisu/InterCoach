export type AnalysisStatus = "processing" | "completed" | "failed";

export type AnalysisLevel = "weak" | "adequate" | "strong" | "exceptional";

export type EvidenceType = "quote" | "absence";

export interface AnalysisFinding {
  dimension: string;
  dimensionLabel: string;
  observation: string;
  evidenceType: EvidenceType;
  evidenceText: string;
  impact: string;
}

export type RecommendationPriority = "high" | "medium" | "low";

export interface AnalysisRecommendation {
  dimension: string;
  dimensionLabel: string;
  action: string;
  /** Paste-ready replacement line. Empty for structural advice. */
  rewrite: string;
  evidenceType: EvidenceType;
  evidenceText: string;
  /** Score points recoverable in this recommendation's dimension. */
  scoreUpside: number;
  priority: RecommendationPriority;
}

export interface AnalysisDimension {
  key: string;
  label: string;
  weight: number;
  level: AnalysisLevel;
  evidenceVerified: boolean;
}

export interface AnalysisRecord {
  analysisId: string;
  resumeId: string;
  status: AnalysisStatus;
  overallScore?: number;
  scoreBand?: string | null;
  dimensions?: AnalysisDimension[];
  strengths: string[];
  weaknesses: string[];
  // Evidence-backed findings. Optional so analyses created before the rubric
  // rollout still render from the flat arrays above.
  strengthDetails?: AnalysisFinding[];
  weaknessDetails?: AnalysisFinding[];
  recommendations: string[];
  // Ranked, evidence-backed suggestions. Optional for the same reason as the
  // findings above: older analyses only have the flat array.
  recommendationDetails?: AnalysisRecommendation[];
  aiModel: string;
  rubricVersion?: string | null;
  promptVersion?: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}
