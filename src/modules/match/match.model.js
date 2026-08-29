import mongoose, { Schema } from "mongoose";
import { AvailableMatchStatuses, MatchStatusEnum } from "../../utils/constants.js";

const matchSchema = new Schema(
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
    jobDescription: {
      type: Schema.Types.ObjectId,
      ref: "JobDescription",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: AvailableMatchStatuses,
      default: MatchStatusEnum.PROCESSING,
      index: true,
    },
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    matchedSkills: {
      type: [String],
      default: [],
    },
    missingSkills: {
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

matchSchema.index({ user: 1, createdAt: -1 });
matchSchema.index({ resume: 1, createdAt: -1 });
matchSchema.index({ jobDescription: 1, createdAt: -1 });

export const Match = mongoose.model("Match", matchSchema);
