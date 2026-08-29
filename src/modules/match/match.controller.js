import {
  createMatchForResumeAndJobDescription,
  getMatchForUser,
  getResumeMatchesForUser,
  serializeMatchRecord,
} from "./match.service.js";
import { ApiResponse } from "../../utils/api-response.js";

export const createMatch = async (req, res) => {
  const match = await createMatchForResumeAndJobDescription({
    resumeId: req.params.resumeId,
    jobDescriptionId: req.params.jobDescriptionId,
    userId: req.user._id,
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        match: serializeMatchRecord(match),
      },
      "Match created successfully",
    ),
  );
};

export const getMatch = async (req, res) => {
  const match = await getMatchForUser({
    matchId: req.params.matchId,
    userId: req.user._id,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        match: serializeMatchRecord(match),
      },
      "Match fetched successfully",
    ),
  );
};

export const getResumeMatchHistory = async (req, res) => {
  const matches = await getResumeMatchesForUser({
    resumeId: req.params.resumeId,
    userId: req.user._id,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        matches: matches.map((match) => serializeMatchRecord(match)),
      },
      "Match history fetched successfully",
    ),
  );
};
