import {
  createAnalysisForResume,
  getAnalysisForUser,
  getResumeAnalysesForUser,
  serializeAnalysisRecord,
} from "./analysis.service.js";
import { ApiResponse } from "../../utils/api-response.js";

export const createAnalysis = async (req, res) => {
  const analysis = await createAnalysisForResume({
    resumeId: req.params.resumeId,
    userId: req.user._id,
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        analysis: serializeAnalysisRecord(analysis),
      },
      "Analysis created successfully",
    ),
  );
};

export const getAnalysis = async (req, res) => {
  const analysis = await getAnalysisForUser({
    analysisId: req.params.analysisId,
    userId: req.user._id,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        analysis: serializeAnalysisRecord(analysis),
      },
      "Analysis fetched successfully",
    ),
  );
};

export const getResumeAnalysisHistory = async (req, res) => {
  const analyses = await getResumeAnalysesForUser({
    resumeId: req.params.resumeId,
    userId: req.user._id,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        analyses: analyses.map((analysis) => serializeAnalysisRecord(analysis)),
      },
      "Analysis history fetched successfully",
    ),
  );
};
