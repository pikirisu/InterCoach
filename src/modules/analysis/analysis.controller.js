import {
  createAnalysisForResume,
  getAnalysisForUser,
  getResumeAnalysesForUser,
  serializeAnalysisRecord,
} from "./analysis.service.js";

const sendErrorResponse = (res, error) => {
  return res.status(error.statusCode || 500).json({
    message: error.message || "Internal Server Error",
  });
};

export const createAnalysis = async (req, res) => {
  try {
    const analysis = await createAnalysisForResume({
      resumeId: req.params.resumeId,
      userId: req.user._id,
    });

    return res.status(201).json({
      success: true,
      data: {
        analysisId: analysis._id,
        status: analysis.status,
      },
    });
  } catch (error) {
    console.error(error);
    return sendErrorResponse(res, error);
  }
};

export const getAnalysis = async (req, res) => {
  try {
    const analysis = await getAnalysisForUser({
      analysisId: req.params.analysisId,
      userId: req.user._id,
    });

    return res.status(200).json({
      success: true,
      data: {
        analysis: serializeAnalysisRecord(analysis),
      },
    });
  } catch (error) {
    console.error(error);
    return sendErrorResponse(res, error);
  }
};

export const getResumeAnalysisHistory = async (req, res) => {
  try {
    const analyses = await getResumeAnalysesForUser({
      resumeId: req.params.resumeId,
      userId: req.user._id,
    });

    return res.status(200).json({
      success: true,
      data: analyses.map((analysis) => serializeAnalysisRecord(analysis)),
    });
  } catch (error) {
    console.error(error);
    return sendErrorResponse(res, error);
  }
};
