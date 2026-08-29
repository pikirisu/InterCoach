import mongoose, { Schema } from "mongoose";
import {
  AvailableJobDescriptionRequirementsStatuses,
  JobDescriptionRequirementsStatusEnum,
  JD_MAX_LENGTH,
  JD_MIN_LENGTH,
} from "../../utils/constants.js";

const jobDescriptionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
      default: "",
    },
    rawText: {
      type: String,
      required: true,
      trim: true,
      minlength: [JD_MIN_LENGTH, `Job description must be at least ${JD_MIN_LENGTH} characters long`],
      maxlength: [JD_MAX_LENGTH, `Job description must be at most ${JD_MAX_LENGTH} characters long`],
    },
    mustHaveSkills: {
      type: [String],
      default: [],
    },
    niceToHaveSkills: {
      type: [String],
      default: [],
    },
    keyResponsibilities: {
      type: [String],
      default: [],
    },
    requirementsStatus: {
      type: String,
      enum: AvailableJobDescriptionRequirementsStatuses,
      default: JobDescriptionRequirementsStatusEnum.PENDING,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

jobDescriptionSchema.index({ user: 1, createdAt: -1 });

export const JobDescription = mongoose.model("JobDescription", jobDescriptionSchema);
