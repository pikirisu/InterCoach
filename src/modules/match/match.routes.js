import { Router } from "express";
import { verifyJWT } from "../../middleware/auth.middleware.js";
import { createMatch, getMatch, getResumeMatchHistory } from "./match.controller.js";
import { asyncHandler } from "../../utils/async-handler.js";

const router = Router();

router.use(verifyJWT);

router
  .route("/resume/:resumeId/job-description/:jobDescriptionId")
  .post(asyncHandler(createMatch));
router.route("/resume/:resumeId").get(asyncHandler(getResumeMatchHistory));
router.route("/:matchId").get(asyncHandler(getMatch));

export default router;
