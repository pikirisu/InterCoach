import { User } from "./user.model.js";
import { ApiResponse } from "../../utils/api-response.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { ApiError } from "../../utils/api-error.js";

const generateAccessAndRefreshTokens = async function (userID) {
  try {
    const user = await User.findById(userID);

    if (!user) {
      throw new ApiError(404, "User not found.");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw error;
  }
};

const sendAuthErrorResponse = (res, error) => {
  console.error(error);

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      message: error.message,
    });
  }

  return res.status(500).json({
    message: "Internal Server Error",
  });
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      throw new ApiError(
        409,
        "User with provided username or email already exists.",
        [],
      );
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
    });

    const { accessToken } = await generateAccessAndRefreshTokens(user._id);

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken",
    );

    if (!createdUser) {
      return res.status(500).json({
        message: "Failed to create user",
      });
    }

    return res.status(201).json({
      message: "User created successfully",
      user: createdUser,
      accessToken,
    });
  } catch (error) {
    return sendAuthErrorResponse(res, error);
  }
};

export const loginUser = async (req, res) => {
  try {
    // Recieve
    const { email, password } = req.body;

    // Check if User passed both entries
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and Password are required",
      });
    }

    // Find User with email
    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    // If User not found
    if (!user) {
      return res.status(401).json({
        message: "Invalid Credentials",
      });
    }

    // Compare password -> Provided in user schema as method
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid Credentials",
      });
    }

    const loggedUser = await User.findById(user._id).select(
      "-password -refreshToken",
    );

    const { accessToken } = await generateAccessAndRefreshTokens(user._id);

    return res.status(200).json({
      user: loggedUser,
      accessToken,
    });
  } catch (error) {
    return sendAuthErrorResponse(res, error);
  }
};
