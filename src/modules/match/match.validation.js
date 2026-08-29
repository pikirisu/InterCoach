import mongoose from "mongoose";
import { normalizeStringArray } from "../../utils/normalizeStringArray.js";

export const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

export const normalizeMatchRecommendationsPayload = (payload = {}) => ({
  recommendations: normalizeStringArray(payload.recommendations, "recommendations"),
});

export const serializeMatch = (match) => ({
  matchId: match._id,
  resumeId: match.resume,
  jobDescriptionId: match.jobDescription,
  status: match.status,
  matchScore: match.matchScore ?? null,
  matchedSkills: match.matchedSkills,
  missingSkills: match.missingSkills,
  recommendations: match.recommendations,
  aiModel: match.aiModel,
  errorMessage: match.errorMessage || null,
  createdAt: match.createdAt,
  updatedAt: match.updatedAt,
});
