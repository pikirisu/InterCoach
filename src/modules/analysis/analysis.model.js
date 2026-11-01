import mongoose, { Schema } from "mongoose";
import {
  AnalysisStatusEnum,
  AvailableAnalysisStatuses,
} from "../../utils/constants.js";
import {
  ANALYSIS_DIMENSION_KEYS,
  AvailableAnalysisLevels,
  AvailableRecommendationPriorities,
  RecommendationPriorityEnum,
} from "../../utils/analysisRubric.js";
import { AvailableEvidenceTypes } from "../../utils/evidence.js";

const findingSchema = new Schema(
  {
    dimension: {
      type: String,
      enum: ANALYSIS_DIMENSION_KEYS,
      required: true,
    },
    dimensionLabel: {
      type: String,
      trim: true,
      default: "",
    },
    observation: {
      type: String,
      trim: true,
      required: true,
    },
    evidenceType: {
      type: String,
      enum: AvailableEvidenceTypes,
      required: true,
    },
    evidenceText: {
      type: String,
      trim: true,
      required: true,
    },
    impact: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: false },
);

const dimensionScoreSchema = new Schema(
  {
    key: {
      type: String,
      enum: ANALYSIS_DIMENSION_KEYS,
      required: true,
    },
    label: {
      type: String,
      trim: true,
      default: "",
    },
    weight: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    level: {
      type: String,
      enum: AvailableAnalysisLevels,
      required: true,
    },
    evidenceVerified: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
);

const recommendationSchema = new Schema(
  {
    dimension: {
      type: String,
      enum: ANALYSIS_DIMENSION_KEYS,
      required: true,
    },
    dimensionLabel: {
      type: String,
      trim: true,
      default: "",
    },
    action: {
      type: String,
      trim: true,
      required: true,
    },
    // Paste-ready replacement line. Empty when the advice is structural rather
    // than a rewrite of one line.
    rewrite: {
      type: String,
      trim: true,
      default: "",
    },
    evidenceType: {
      type: String,
      enum: AvailableEvidenceTypes,
      required: true,
    },
    evidenceText: {
      type: String,
      trim: true,
      required: true,
    },
    // Score points recoverable in this recommendation's dimension. Computed
    // from the rubric, never supplied by the model.
    scoreUpside: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    priority: {
      type: String,
      enum: AvailableRecommendationPriorities,
      default: RecommendationPriorityEnum.LOW,
    },
  },
  { _id: false },
);

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
    scoreBand: {
      type: String,
      trim: true,
      default: "",
    },
    dimensions: {
      type: [dimensionScoreSchema],
      default: [],
    },
    strengthDetails: {
      type: [findingSchema],
      default: [],
    },
    weaknessDetails: {
      type: [findingSchema],
      default: [],
    },
    // Flattened copies of the findings above. Retained for existing clients;
    // new consumers should read `strengthDetails` / `weaknessDetails`.
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },
    recommendationDetails: {
      type: [recommendationSchema],
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
    // Stored so a score stays explainable after the rubric or prompt is tuned.
    rubricVersion: {
      type: String,
      trim: true,
      default: "",
    },
    promptVersion: {
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
