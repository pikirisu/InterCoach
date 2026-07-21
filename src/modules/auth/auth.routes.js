import { Router } from "express";
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "./auth.controller.js";
import { verifyJWT } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";

const router = Router();

router.post("/register", asyncHandler(registerUser));
router.post("/login", asyncHandler(loginUser));
router.post("/refresh-token", asyncHandler(refreshAccessToken));
router.post("/logout", verifyJWT, asyncHandler(logoutUser));

export default router;
