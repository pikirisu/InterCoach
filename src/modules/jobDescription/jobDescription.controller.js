import {
  createJobDescription,
  deleteJobDescriptionForUser,
  getJobDescriptionForUser,
  getMyJobDescriptions,
  serializeJobDescriptionRecord,
} from "./jobDescription.service.js";
import { serializeJobDescriptionSummary } from "./jobDescription.validation.js";
import { ApiError } from "../../utils/api-error.js";
import { ApiResponse } from "../../utils/api-response.js";

export const createJobDescriptionHandler = async (req, res) => {
  const { title, company, rawText } = req.body;

  if (!title || !rawText) {
    throw new ApiError(400, "Title and job description text are required");
  }

  const jobDescription = await createJobDescription({
    title,
    company,
    rawText,
    userId: req.user._id,
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        jobDescription: serializeJobDescriptionRecord(jobDescription),
      },
      "Job description created successfully",
    ),
  );
};

export const getMyJobDescriptionsHandler = async (req, res) => {
  const jobDescriptions = await getMyJobDescriptions(req.user._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        jobDescriptions: jobDescriptions.map((jobDescription) =>
          serializeJobDescriptionSummary(jobDescription),
        ),
      },
      "Job descriptions fetched successfully",
    ),
  );
};

export const getJobDescriptionHandler = async (req, res) => {
  const jobDescription = await getJobDescriptionForUser({
    jobDescriptionId: req.params.jobDescriptionId,
    userId: req.user._id,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        jobDescription: serializeJobDescriptionRecord(jobDescription),
      },
      "Job description fetched successfully",
    ),
  );
};

export const deleteJobDescriptionHandler = async (req, res) => {
  const jobDescription = await deleteJobDescriptionForUser({
    jobDescriptionId: req.params.jobDescriptionId,
    userId: req.user._id,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        jobDescriptionId: jobDescription._id,
      },
      "Job description deleted successfully",
    ),
  );
};
