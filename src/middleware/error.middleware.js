import { ApiError } from "../utils/api-error.js";

const isProduction = process.env.NODE_ENV === "production";

const normalizeStatusCode = (error) => {
  const statusCode = error.statusCode || error.status;

  if (Number.isInteger(statusCode) && statusCode >= 400 && statusCode < 600) {
    return statusCode;
  }

  if (error.name === "ValidationError" || error.name === "CastError") {
    return 400;
  }

  if (error.code === 11000) {
    return 409;
  }

  return 500;
};

const normalizeMessage = (error, statusCode) => {
  if (error.code === 11000) {
    return "Duplicate field value";
  }

  if (statusCode === 500 && !(error instanceof ApiError)) {
    return "Internal Server Error";
  }

  return error.message || "Internal Server Error";
};

const normalizeErrors = (error) => {
  if (Array.isArray(error.errors)) {
    return error.errors;
  }

  if (error.name === "ValidationError") {
    return Object.values(error.errors).map((validationError) => ({
      field: validationError.path,
      message: validationError.message,
    }));
  }

  if (error.code === 11000) {
    return Object.keys(error.keyValue || {}).map((field) => ({
      field,
      message: `${field} already exists`,
    }));
  }

  return [];
};

export const notFoundHandler = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};

export const errorHandler = (error, req, res, next) => {
  const statusCode = normalizeStatusCode(error);
  const response = {
    success: false,
    statusCode,
    message: normalizeMessage(error, statusCode),
    errors: normalizeErrors(error),
  };

  if (error.data !== undefined && error.data !== null) {
    response.data = error.data;
  }

  if (!isProduction && error.stack) {
    response.stack = error.stack;
  }

  if (statusCode >= 500) {
    console.error(error);
  }

  return res.status(statusCode).json(response);
};
