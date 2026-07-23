import { Router } from "express";
import { verifyJWT } from "../../middleware/auth.middleware.js";
import {
  deleteResume,
  getMyResumes,
  getResumeById,
  uploadResume,
} from "./resume.controller.js";
import { uploadResumeFile } from "../../middleware/resume.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";

const router = Router();

router.use(verifyJWT);

router
  .route("/")
  .post(uploadResumeFile, asyncHandler(uploadResume))
  .get(asyncHandler(getMyResumes));

router
  .route("/:resumeId")
  .get(asyncHandler(getResumeById))
  .delete(asyncHandler(deleteResume));

export default router;
