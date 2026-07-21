import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { User } from "../modules/auth/user.model.js";
import { ApiError } from "../utils/api-error.js";

const normalizeSessionVersion = (value) => {
  const numericVersion = Number(value);

  if (Number.isInteger(numericVersion) && numericVersion >= 0) {
    return numericVersion;
  }

  return 0;
};

export const verifyJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiError(401, "Unauthorized"));
  }

  const token = authHeader.split(" ")[1];
  let decodedToken;

  try {
    decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    return next(new ApiError(401, "Unauthorized"));
  }

  if (!decodedToken?._id || !mongoose.Types.ObjectId.isValid(decodedToken._id)) {
    return next(new ApiError(401, "Unauthorized"));
  }

  try {
    const user = await User.findById(decodedToken._id);

    if (!user) {
      return next(new ApiError(401, "Unauthorized"));
    }

    const tokenSessionVersion = normalizeSessionVersion(
      decodedToken.sessionVersion,
    );
    const userSessionVersion = normalizeSessionVersion(user.sessionVersion);

    if (tokenSessionVersion !== userSessionVersion) {
      return next(new ApiError(401, "Unauthorized"));
    }

    req.user = {
      _id: user._id,
    };

    return next();
  } catch (error) {
    if (error.name === "CastError") {
      return next(new ApiError(401, "Unauthorized"));
    }

    return next(error);
  }
};
