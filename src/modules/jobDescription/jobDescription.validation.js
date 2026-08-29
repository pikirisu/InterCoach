import mongoose from "mongoose";
import { normalizeStringArray } from "../../utils/normalizeStringArray.js";

export const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

export const normalizeJdRequirementsPayload = (payload = {}) => ({
  mustHaveSkills: normalizeStringArray(payload.mustHaveSkills, "mustHaveSkills"),
  niceToHaveSkills: normalizeStringArray(payload.niceToHaveSkills, "niceToHaveSkills"),
  keyResponsibilities: normalizeStringArray(payload.keyResponsibilities, "keyResponsibilities"),
});

export const serializeJobDescriptionSummary = (jobDescription) => ({
  jobDescriptionId: jobDescription._id,
  title: jobDescription.title,
  company: jobDescription.company,
  requirementsStatus: jobDescription.requirementsStatus,
  createdAt: jobDescription.createdAt,
  updatedAt: jobDescription.updatedAt,
});

export const serializeJobDescriptionDetail = (jobDescription) => ({
  ...serializeJobDescriptionSummary(jobDescription),
  rawText: jobDescription.rawText,
  mustHaveSkills: jobDescription.mustHaveSkills,
  niceToHaveSkills: jobDescription.niceToHaveSkills,
  keyResponsibilities: jobDescription.keyResponsibilities,
});
