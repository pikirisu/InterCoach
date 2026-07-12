import { Router } from "express";
import { verifyJWT } from "../../middleware/auth.middleware.js";
import {
  createAnalysis,
  getAnalysis,
  getResumeAnalysisHistory,
} from "./analysis.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/resume/:resumeId").post(createAnalysis).get(getResumeAnalysisHistory);
router.route("/:analysisId").get(getAnalysis);

export default router;
