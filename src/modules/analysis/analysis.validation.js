import mongoose from "mongoose";
import { normalizeStringArray } from "../../utils/normalizeStringArray.js";

export const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

export const normalizeAnalysisPayload = (payload = {}) => {
  const numericScore = Number(payload.overallScore);

  if (!Number.isFinite(numericScore)) {
    throw new Error("overallScore must be a valid number");
  }

  return {
    overallScore: Math.max(0, Math.min(100, Math.round(numericScore))),
    strengths: normalizeStringArray(payload.strengths, "strengths"),
    weaknesses: normalizeStringArray(payload.weaknesses, "weaknesses"),
    recommendations: normalizeStringArray(
      payload.recommendations,
      "recommendations",
    ),
  };
};

export const serializeAnalysis = (analysis) => ({
  analysisId: analysis._id,
  resumeId: analysis.resume,
  status: analysis.status,
  overallScore: analysis.overallScore ?? null,
  strengths: analysis.strengths,
  weaknesses: analysis.weaknesses,
  recommendations: analysis.recommendations,
  aiModel: analysis.aiModel,
  errorMessage: analysis.errorMessage || null,
  createdAt: analysis.createdAt,
  updatedAt: analysis.updatedAt,
});
