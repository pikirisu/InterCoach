import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRouter from "./modules/auth/auth.routes.js";
import analysisRouter from "./modules/analysis/analysis.routes.js";
import resumeRouter from "./modules/resume/resume.routes.js";
import { ApiResponse } from "./utils/api-response.js";
import { ApiError } from "./utils/api-error.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error.middleware.js";

const app = express();

const defaultCorsOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:7152",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:7152",
];

const getAllowedCorsOrigins = () => {
  const configuredOrigins = process.env.CORS_ORIGIN?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return configuredOrigins?.length ? configuredOrigins : defaultCorsOrigins;
};

const allowedCorsOrigins = getAllowedCorsOrigins();

const databaseStateLabels = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

const healthcheck = (req, res) => {
  const databaseReadyState = mongoose.connection.readyState;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: {
          readyState: databaseReadyState,
          status: databaseStateLabels[databaseReadyState] || "unknown",
        },
      },
      "Healthcheck passed",
    ),
  );
};

app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        allowedCorsOrigins.includes("*") ||
        allowedCorsOrigins.includes(origin)
      ) {
        callback(null, true);
        return;
      }

      callback(new ApiError(403, `CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        name: "Inter Coach API",
        version: "v1",
      },
      "Inter Coach API is running",
    ),
  );
});

app.get("/health", healthcheck);
app.get("/api/v1/health", healthcheck);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/analysis", analysisRouter);
app.use("/api/v1/resumes", resumeRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
