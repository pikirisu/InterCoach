import { JobDescription } from "./jobDescription.model.js";
import { isValidObjectId, serializeJobDescriptionDetail } from "./jobDescription.validation.js";
import { extractJobRequirements } from "../../services/ai/ai.service.js";
import { JobDescriptionRequirementsStatusEnum } from "../../utils/constants.js";
import { ApiError } from "../../utils/api-error.js";

const assertJobDescriptionOwnership = (jobDescription, userId) => {
  if (String(jobDescription.user) !== String(userId)) {
    throw new ApiError(403, "Not authorized");
  }
};

export const createJobDescription = async ({ title, company, rawText, userId }) => {
  const jobDescription = await JobDescription.create({
    user: userId,
    title,
    company: company || "",
    rawText,
  });

  try {
    const requirements = await extractJobRequirements(rawText);

    jobDescription.mustHaveSkills = requirements.mustHaveSkills;
    jobDescription.niceToHaveSkills = requirements.niceToHaveSkills;
    jobDescription.keyResponsibilities = requirements.keyResponsibilities;
    jobDescription.requirementsStatus = JobDescriptionRequirementsStatusEnum.EXTRACTED;
  } catch (error) {
    jobDescription.requirementsStatus = JobDescriptionRequirementsStatusEnum.FAILED;
  }

  await jobDescription.save();

  return jobDescription;
};

export const ensureJobDescriptionRequirements = async (jobDescription) => {
  if (jobDescription.requirementsStatus === JobDescriptionRequirementsStatusEnum.EXTRACTED) {
    return jobDescription;
  }

  try {
    const requirements = await extractJobRequirements(jobDescription.rawText);

    jobDescription.mustHaveSkills = requirements.mustHaveSkills;
    jobDescription.niceToHaveSkills = requirements.niceToHaveSkills;
    jobDescription.keyResponsibilities = requirements.keyResponsibilities;
    jobDescription.requirementsStatus = JobDescriptionRequirementsStatusEnum.EXTRACTED;
    await jobDescription.save();
  } catch (error) {
    jobDescription.requirementsStatus = JobDescriptionRequirementsStatusEnum.FAILED;
    await jobDescription.save();
  }

  return jobDescription;
};

export const getMyJobDescriptions = async (userId) =>
  JobDescription.find({ user: userId })
    .sort({ createdAt: -1 })
    .select("_id title company requirementsStatus createdAt updatedAt");

export const getJobDescriptionForUser = async ({ jobDescriptionId, userId }) => {
  if (!isValidObjectId(jobDescriptionId)) {
    throw new ApiError(400, "Invalid job description id");
  }

  const jobDescription = await JobDescription.findOne({
    _id: jobDescriptionId,
    user: userId,
  });

  if (!jobDescription) {
    throw new ApiError(404, "Job description not found");
  }

  return jobDescription;
};

export const deleteJobDescriptionForUser = async ({ jobDescriptionId, userId }) => {
  if (!isValidObjectId(jobDescriptionId)) {
    throw new ApiError(400, "Invalid job description id");
  }

  const jobDescription = await JobDescription.findOneAndDelete({
    _id: jobDescriptionId,
    user: userId,
  });

  if (!jobDescription) {
    throw new ApiError(404, "Job description not found");
  }

  return jobDescription;
};

export const serializeJobDescriptionRecord = (jobDescription) =>
  serializeJobDescriptionDetail(jobDescription);

export { assertJobDescriptionOwnership };
