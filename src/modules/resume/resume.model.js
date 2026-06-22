import mongoose, { Schema } from "mongoose";
import {
  AvailableResumeStatuses,
  ResumeStatusEnum,
} from "../../utils/constants.js";

const resumeSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    originalFileName: {
      type: String,
      required: true,
      trim: true,
    },
    filePath: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
      default: "application/pdf",
    },
    fileSize: {
      type: Number,
      required: true,
    },
    extractedText: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: AvailableResumeStatuses,
      default: ResumeStatusEnum.UPLOADED,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

resumeSchema.index({ user: 1, createdAt: -1 });

export const Resume = mongoose.model("Resume", resumeSchema);
