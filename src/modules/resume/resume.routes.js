import { Router } from "express";
import { verifyJWT } from "../../middleware/auth.middleware.js";
import {
  deleteResume,
  getMyResumes,
  getResumeById,
  uploadResume,
} from "./resume.controller.js";
import { uploadResumeFile } from "../../middleware/resume.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(uploadResumeFile, uploadResume).get(getMyResumes);

router.route("/:resumeId").get(getResumeById).delete(deleteResume);

export default router;
