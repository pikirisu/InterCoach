import mongoose, { Schema } from "mongoose";
import {
  AnalysisStatusEnum,
  AvailableAnalysisStatuses,
} from "../../utils/constants.js";

const analysisSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    resume: {
      type: Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: AvailableAnalysisStatuses,
      default: AnalysisStatusEnum.PROCESSING,
      index: true,
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },
    recommendations: {
      type: [String],
      default: [],
    },
    aiModel: {
      type: String,
      trim: true,
      default: "",
    },
    errorMessage: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

analysisSchema.index({ user: 1, createdAt: -1 });
analysisSchema.index({ resume: 1, createdAt: -1 });

export const Analysis = mongoose.model("Analysis", analysisSchema);
