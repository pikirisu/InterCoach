import { Router } from "express";
import { verifyJWT } from "../../middleware/auth.middleware.js";
import {
  createAnalysis,
  getAnalysis,
  getResumeAnalysisHistory,
} from "./analysis.controller.js";
import { asyncHandler } from "../../utils/async-handler.js";

const router = Router();

router.use(verifyJWT);

router
  .route("/resume/:resumeId")
  .post(asyncHandler(createAnalysis))
  .get(asyncHandler(getResumeAnalysisHistory));
router.route("/:analysisId").get(asyncHandler(getAnalysis));

export default router;
