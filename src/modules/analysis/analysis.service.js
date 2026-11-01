import { Resume } from "../resume/resume.model.js";
import { Analysis } from "./analysis.model.js";
import { isValidObjectId, serializeAnalysis } from "./analysis.validation.js";
import {
  generateResumeAnalysis,
  getConfiguredAIModel,
} from "../../services/ai/ai.service.js";
import { AnalysisStatusEnum } from "../../utils/constants.js";
import { ANALYSIS_PROMPT_VERSION } from "../../utils/analysisRubric.js";
import { ApiError } from "../../utils/api-error.js";

const assertValidObjectId = (value, entityName) => {
  if (!isValidObjectId(value)) {
    throw new ApiError(400, `Invalid ${entityName} id`);
  }
};

const assertResumeOwnership = (resume, userId) => {
  if (String(resume.user) !== String(userId)) {
    throw new ApiError(403, "Not authorized");
  }
};

const assertAnalysisOwnership = (analysis, userId) => {
  if (String(analysis.user) !== String(userId)) {
    throw new ApiError(403, "Not authorized");
  }
};

export const createAnalysisForResume = async ({ resumeId, userId }) => {
  assertValidObjectId(resumeId, "resume");

  const resume = await Resume.findById(resumeId).select(
    "_id user extractedText",
  );

  if (!resume) {
    throw new ApiError(404, "Resume not found");
  }

  assertResumeOwnership(resume, userId);

  if (!resume.extractedText?.trim()) {
    throw new ApiError(400, "Resume content unavailable");
  }

  const analysis = await Analysis.create({
    user: userId,
    resume: resume._id,
    status: AnalysisStatusEnum.PROCESSING,
    aiModel: getConfiguredAIModel(),
    promptVersion: ANALYSIS_PROMPT_VERSION,
  });

  try {
    const analysisPayload = await generateResumeAnalysis(resume.extractedText, {
      // Ties the sampling seed to the resume, so re-running an analysis on the
      // same resume follows the same decoding path.
      seedSource: String(resume._id),
    });

    analysis.overallScore = analysisPayload.overallScore;
    analysis.scoreBand = analysisPayload.scoreBand;
    analysis.dimensions = analysisPayload.dimensions;
    analysis.strengthDetails = analysisPayload.strengthDetails;
    analysis.weaknessDetails = analysisPayload.weaknessDetails;
    analysis.strengths = analysisPayload.strengths;
    analysis.weaknesses = analysisPayload.weaknesses;
    analysis.recommendationDetails = analysisPayload.recommendationDetails;
    analysis.recommendations = analysisPayload.recommendations;
    analysis.rubricVersion = analysisPayload.rubricVersion;
    analysis.status = AnalysisStatusEnum.COMPLETED;
    analysis.errorMessage = "";

    await analysis.save();

    return analysis;
  } catch (error) {
    analysis.status = AnalysisStatusEnum.FAILED;
    analysis.errorMessage = error.message || "Analysis generation failed";
    await analysis.save();

    throw new ApiError(500, "Failed to generate analysis", [], "", {
      analysis: serializeAnalysis(analysis),
    });
  }
};

export const getAnalysisForUser = async ({ analysisId, userId }) => {
  assertValidObjectId(analysisId, "analysis");

  const analysis = await Analysis.findById(analysisId);

  if (!analysis) {
    throw new ApiError(404, "Analysis not found");
  }

  assertAnalysisOwnership(analysis, userId);

  return analysis;
};

export const getResumeAnalysesForUser = async ({ resumeId, userId }) => {
  assertValidObjectId(resumeId, "resume");

  const resume = await Resume.findById(resumeId).select("_id user");

  if (!resume) {
    throw new ApiError(404, "Resume not found");
  }

  assertResumeOwnership(resume, userId);

  const analyses = await Analysis.find({
    resume: resume._id,
    user: userId,
  }).sort({ createdAt: -1 });

  return analyses;
};

export const serializeAnalysisRecord = (analysis) =>
  serializeAnalysis(analysis);
