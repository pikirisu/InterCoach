import { Resume } from "../resume/resume.model.js";
import { Analysis } from "./analysis.model.js";
import {
  isValidObjectId,
  serializeAnalysis,
} from "./analysis.validation.js";
import {
  generateResumeAnalysis,
  getConfiguredAIModel,
} from "../../services/ai/ai.service.js";
import { AnalysisStatusEnum } from "../../utils/constants.js";

const createServiceError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const assertValidObjectId = (value, entityName) => {
  if (!isValidObjectId(value)) {
    throw createServiceError(400, `Invalid ${entityName} id`);
  }
};

const assertResumeOwnership = (resume, userId) => {
  if (String(resume.user) !== String(userId)) {
    throw createServiceError(403, "Not authorized");
  }
};

const assertAnalysisOwnership = (analysis, userId) => {
  if (String(analysis.user) !== String(userId)) {
    throw createServiceError(403, "Not authorized");
  }
};

export const createAnalysisForResume = async ({ resumeId, userId }) => {
  assertValidObjectId(resumeId, "resume");

  const resume = await Resume.findById(resumeId).select("_id user extractedText");

  if (!resume) {
    throw createServiceError(404, "Resume not found");
  }

  assertResumeOwnership(resume, userId);

  if (!resume.extractedText?.trim()) {
    throw createServiceError(400, "Resume content unavailable");
  }

  const analysis = await Analysis.create({
    user: userId,
    resume: resume._id,
    status: AnalysisStatusEnum.PROCESSING,
    aiModel: getConfiguredAIModel(),
  });

  try {
    const analysisPayload = await generateResumeAnalysis(resume.extractedText);

    analysis.overallScore = analysisPayload.overallScore;
    analysis.strengths = analysisPayload.strengths;
    analysis.weaknesses = analysisPayload.weaknesses;
    analysis.recommendations = analysisPayload.recommendations;
    analysis.status = AnalysisStatusEnum.COMPLETED;
    analysis.errorMessage = "";

    await analysis.save();

    return analysis;
  } catch (error) {
    analysis.status = AnalysisStatusEnum.FAILED;
    analysis.errorMessage = error.message || "Analysis generation failed";
    await analysis.save();

    throw createServiceError(500, "Failed to generate analysis");
  }
};

export const getAnalysisForUser = async ({ analysisId, userId }) => {
  assertValidObjectId(analysisId, "analysis");

  const analysis = await Analysis.findById(analysisId);

  if (!analysis) {
    throw createServiceError(404, "Analysis not found");
  }

  assertAnalysisOwnership(analysis, userId);

  return analysis;
};

export const getResumeAnalysesForUser = async ({ resumeId, userId }) => {
  assertValidObjectId(resumeId, "resume");

  const resume = await Resume.findById(resumeId).select("_id user");

  if (!resume) {
    throw createServiceError(404, "Resume not found");
  }

  assertResumeOwnership(resume, userId);

  const analyses = await Analysis.find({
    resume: resume._id,
    user: userId,
  }).sort({ createdAt: -1 });

  return analyses;
};

export const serializeAnalysisRecord = (analysis) => serializeAnalysis(analysis);
