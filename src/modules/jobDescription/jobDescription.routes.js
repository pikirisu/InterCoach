import { Router } from "express";
import { verifyJWT } from "../../middleware/auth.middleware.js";
import {
  createJobDescriptionHandler,
  deleteJobDescriptionHandler,
  getJobDescriptionHandler,
  getMyJobDescriptionsHandler,
} from "./jobDescription.controller.js";
import { asyncHandler } from "../../utils/async-handler.js";

const router = Router();

router.use(verifyJWT);

router
  .route("/")
  .post(asyncHandler(createJobDescriptionHandler))
  .get(asyncHandler(getMyJobDescriptionsHandler));

router
  .route("/:jobDescriptionId")
  .get(asyncHandler(getJobDescriptionHandler))
  .delete(asyncHandler(deleteJobDescriptionHandler));

export default router;
