import { Resume } from "../resume/resume.model.js";
import { JobDescription } from "../jobDescription/jobDescription.model.js";
import { ensureJobDescriptionRequirements } from "../jobDescription/jobDescription.service.js";
import { Match } from "./match.model.js";
import { isValidObjectId, serializeMatch } from "./match.validation.js";
import { generateMatchRecommendations, getConfiguredAIModel } from "../../services/ai/ai.service.js";
import { computeMatchScore } from "../../utils/skillMatch.js";
import { JobDescriptionRequirementsStatusEnum, MatchStatusEnum } from "../../utils/constants.js";
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

const assertJobDescriptionOwnership = (jobDescription, userId) => {
  if (String(jobDescription.user) !== String(userId)) {
    throw new ApiError(403, "Not authorized");
  }
};

const assertMatchOwnership = (match, userId) => {
  if (String(match.user) !== String(userId)) {
    throw new ApiError(403, "Not authorized");
  }
};

export const createMatchForResumeAndJobDescription = async ({
  resumeId,
  jobDescriptionId,
  userId,
}) => {
  assertValidObjectId(resumeId, "resume");
  assertValidObjectId(jobDescriptionId, "job description");

  const resume = await Resume.findById(resumeId).select("_id user extractedText");

  if (!resume) {
    throw new ApiError(404, "Resume not found");
  }

  assertResumeOwnership(resume, userId);

  if (!resume.extractedText?.trim()) {
    throw new ApiError(400, "Resume content unavailable");
  }

  let jobDescription = await JobDescription.findById(jobDescriptionId).select(
    "_id user rawText mustHaveSkills niceToHaveSkills requirementsStatus",
  );

  if (!jobDescription) {
    throw new ApiError(404, "Job description not found");
  }

  assertJobDescriptionOwnership(jobDescription, userId);

  jobDescription = await ensureJobDescriptionRequirements(jobDescription);

  if (jobDescription.requirementsStatus !== JobDescriptionRequirementsStatusEnum.EXTRACTED) {
    throw new ApiError(400, "Job description requirements unavailable");
  }

  const match = await Match.create({
    user: userId,
    resume: resume._id,
    jobDescription: jobDescription._id,
    status: MatchStatusEnum.PROCESSING,
    aiModel: getConfiguredAIModel(),
  });

  try {
    const { matchScore, matchedSkills, missingSkills } = computeMatchScore({
      mustHaveSkills: jobDescription.mustHaveSkills,
      niceToHaveSkills: jobDescription.niceToHaveSkills,
      resumeText: resume.extractedText,
    });

    const { recommendations } = await generateMatchRecommendations({
      resumeText: resume.extractedText,
      jobDescriptionText: jobDescription.rawText,
      matchedSkills,
      missingSkills,
      matchScore,
    });

    match.matchScore = matchScore;
    match.matchedSkills = matchedSkills;
    match.missingSkills = missingSkills;
    match.recommendations = recommendations;
    match.status = MatchStatusEnum.COMPLETED;
    match.errorMessage = "";

    await match.save();

    return match;
  } catch (error) {
    match.status = MatchStatusEnum.FAILED;
    match.errorMessage = error.message || "Match generation failed";
    await match.save();

    throw new ApiError(500, "Failed to generate match", [], "", {
      match: serializeMatch(match),
    });
  }
};

export const getMatchForUser = async ({ matchId, userId }) => {
  assertValidObjectId(matchId, "match");

  const match = await Match.findById(matchId);

  if (!match) {
    throw new ApiError(404, "Match not found");
  }

  assertMatchOwnership(match, userId);

  return match;
};

export const getResumeMatchesForUser = async ({ resumeId, userId }) => {
  assertValidObjectId(resumeId, "resume");

  const resume = await Resume.findById(resumeId).select("_id user");

  if (!resume) {
    throw new ApiError(404, "Resume not found");
  }

  assertResumeOwnership(resume, userId);

  const matches = await Match.find({
    resume: resume._id,
    user: userId,
  }).sort({ createdAt: -1 });

  return matches;
};

export const serializeMatchRecord = (match) => serializeMatch(match);
