import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { User } from "./user.model.js";
import { ApiResponse } from "../../utils/api-response.js";
import { ApiError } from "../../utils/api-error.js";

const SAFE_USER_FIELDS = "-password -refreshToken -sessionVersion";

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const normalizeSessionVersion = (value) => {
  const numericVersion = Number(value);

  if (Number.isInteger(numericVersion) && numericVersion >= 0) {
    return numericVersion;
  }

  return 0;
};

const getRefreshTokenFromRequest = (req) => {
  const refreshToken = req.body?.refreshToken;

  return typeof refreshToken === "string" ? refreshToken.trim() : "";
};

const bumpSessionVersion = (user) => {
  user.sessionVersion = normalizeSessionVersion(user.sessionVersion) + 1;
};

const persistTokenPair = async (user) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

const invalidateUserSession = async (user) => {
  user.refreshToken = "";
  bumpSessionVersion(user);
  await user.save({ validateBeforeSave: false });
};

const generateAccessAndRefreshTokens = async (
  userId,
  { invalidateExistingSession = false } = {},
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (invalidateExistingSession) {
    bumpSessionVersion(user);
  }

  return persistTokenPair(user);
};

const getSafeUserById = (userId) =>
  User.findById(userId).select(SAFE_USER_FIELDS);

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const normalizedEmail = email.toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    throw new ApiError(409, "User with provided email already exists");
  }

  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
  });

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
  );
  const createdUser = await getSafeUserById(user._id);

  if (!createdUser) {
    throw new ApiError(500, "Failed to create user");
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        user: createdUser,
        accessToken,
        refreshToken,
      },
      "User created successfully",
    ),
  );
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
    { invalidateExistingSession: true },
  );
  const loggedInUser = await getSafeUserById(user._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: loggedInUser,
        accessToken,
        refreshToken,
      },
      "User logged in successfully",
    ),
  );
};

export const refreshAccessToken = async (req, res) => {
  const incomingRefreshToken = getRefreshTokenFromRequest(req);

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  let decodedToken;

  try {
    decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token");
  }

  if (!decodedToken?._id || !isValidObjectId(decodedToken._id)) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const user = await User.findById(decodedToken._id);

  if (!user || !user.refreshToken) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const tokenSessionVersion = normalizeSessionVersion(
    decodedToken.sessionVersion,
  );
  const userSessionVersion = normalizeSessionVersion(user.sessionVersion);

  if (
    user.refreshToken !== incomingRefreshToken ||
    tokenSessionVersion !== userSessionVersion
  ) {
    await invalidateUserSession(user);
    throw new ApiError(401, "Invalid refresh token");
  }

  const { accessToken, refreshToken } = await persistTokenPair(user);
  const refreshedUser = await getSafeUserById(user._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: refreshedUser,
        accessToken,
        refreshToken,
      },
      "Access token refreshed successfully",
    ),
  );
};

export const logoutUser = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(401, "Unauthorized");
  }

  await invalidateUserSession(user);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        userId: user._id,
      },
      "User logged out successfully",
    ),
  );
};
