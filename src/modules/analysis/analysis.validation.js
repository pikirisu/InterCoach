import mongoose from "mongoose";
import {
  ANALYSIS_DIMENSION_KEYS,
  ANALYSIS_DIMENSIONS,
  ANALYSIS_RUBRIC_VERSION,
  AvailableAnalysisLevels,
  computeOverallScore,
  computeScoreUpside,
  getAnalysisDimension,
  getPriorityBand,
  getScoreBand,
  isWeaknessRequiredLevel,
  MAX_RECOMMENDATIONS,
} from "../../utils/analysisRubric.js";
import {
  EvidenceTypeEnum,
  MIN_RECOMMENDATION_QUOTE_WORDS,
  normalizeForEvidence,
  verifyEvidence,
} from "../../utils/evidence.js";

export const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const MAX_TEXT_LENGTH = 400;
const MAX_REWRITE_LENGTH = 600;

const readText = (value, fieldName) => {
  const text = String(value ?? "").trim();

  if (!text) {
    throw new Error(`${fieldName} must be a non-empty string`);
  }

  return text.slice(0, MAX_TEXT_LENGTH);
};

const normalizeFinding = ({
  finding,
  dimension,
  findingType,
  resumeTextNormalized,
  rejected,
}) => {
  if (!finding || typeof finding !== "object") {
    return null;
  }

  const label = `${dimension.key}.${findingType}`;
  const evidenceType = String(finding.evidenceType ?? "").trim();
  const evidenceText = String(finding.evidenceText ?? "").trim();

  const verification = verifyEvidence({
    resumeTextNormalized,
    evidenceType,
    evidenceText,
  });

  if (!verification.ok) {
    rejected.push(`${label}: ${verification.reason}`);
    return null;
  }

  let observation;
  let impact;

  try {
    observation = readText(finding.observation, `${label}.observation`);
    impact = readText(finding.impact, `${label}.impact`);
  } catch (error) {
    rejected.push(`${label}: ${error.message}`);
    return null;
  }

  return {
    dimension: dimension.key,
    dimensionLabel: dimension.label,
    observation,
    evidenceType,
    evidenceText,
    impact,
  };
};

/**
 * Recommendations get the same treatment as findings: each one has to name the
 * rubric dimension it serves and point at the resume span it wants changed, and
 * anything unverifiable is dropped rather than shown.
 *
 * Ranking is done here rather than by the model. Each recommendation inherits
 * the score upside of its dimension, so the list is ordered by how many points
 * acting on it can actually recover - and the order is identical on every run.
 */
const normalizeRecommendations = ({
  raw,
  levelsByDimension,
  resumeTextNormalized,
  rejected,
}) => {
  if (!Array.isArray(raw)) {
    throw new Error("recommendations must be an array");
  }

  const seenTargets = new Set();
  const accepted = [];

  raw.forEach((item, index) => {
    const label = `recommendation[${index}]`;

    // A bare string cannot be tied back to the resume, which is the entire
    // point - so the old free-text shape is rejected rather than passed through.
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      rejected.push(`${label}: not an evidence-bound recommendation object`);
      return;
    }

    const dimensionKey = String(item.dimension ?? "").trim();
    const dimension = getAnalysisDimension(dimensionKey);

    if (!dimension) {
      rejected.push(`${label}: unknown dimension "${dimensionKey}"`);
      return;
    }

    const evidenceType = String(item.evidenceType ?? "").trim();
    const evidenceText = String(item.evidenceText ?? "").trim();

    const verification = verifyEvidence({
      resumeTextNormalized,
      evidenceType,
      evidenceText,
      minQuoteWords: MIN_RECOMMENDATION_QUOTE_WORDS,
    });

    if (!verification.ok) {
      rejected.push(`${label}: ${verification.reason}`);
      return;
    }

    let action;

    try {
      action = readText(item.action, `${label}.action`);
    } catch (error) {
      rejected.push(`${label}: ${error.message}`);
      return;
    }

    const targetKey = `${dimension.key}::${normalizeForEvidence(evidenceText)}`;

    if (seenTargets.has(targetKey)) {
      rejected.push(`${label}: repeats an earlier target for "${dimension.key}"`);
      return;
    }

    seenTargets.add(targetKey);

    const scoreUpside = computeScoreUpside(
      dimension.key,
      levelsByDimension[dimension.key],
    );

    accepted.push({
      dimension: dimension.key,
      dimensionLabel: dimension.label,
      action,
      rewrite: String(item.rewrite ?? "").trim().slice(0, MAX_REWRITE_LENGTH),
      evidenceType,
      evidenceText,
      scoreUpside,
      priority: getPriorityBand(scoreUpside),
      sourceIndex: index,
    });
  });

  // Ties break on rubric order, then on the order the model emitted them, so
  // two identical payloads always produce the same ranked list.
  accepted.sort(
    (a, b) =>
      b.scoreUpside - a.scoreUpside ||
      ANALYSIS_DIMENSION_KEYS.indexOf(a.dimension) -
        ANALYSIS_DIMENSION_KEYS.indexOf(b.dimension) ||
      a.sourceIndex - b.sourceIndex,
  );

  return accepted
    .slice(0, MAX_RECOMMENDATIONS)
    .map(({ sourceIndex, ...recommendation }) => recommendation);
};

/**
 * Turns the model's per-dimension verdicts into a scored analysis.
 *
 * The model supplies only ordinal levels and evidence-backed findings. The
 * 0-100 score is computed here from fixed weights, and any finding whose
 * evidence cannot be located in (or, for absences, ruled out of) the resume is
 * discarded before it reaches the user.
 */
export const normalizeAnalysisPayload = (payload = {}, { resumeText } = {}) => {
  const resumeTextNormalized = normalizeForEvidence(resumeText);

  if (!resumeTextNormalized) {
    throw new Error("Resume text is required to verify analysis evidence");
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Analysis payload must be an object");
  }

  const rawDimensions = payload.dimensions;

  if (!rawDimensions || typeof rawDimensions !== "object") {
    throw new Error("dimensions must be an object keyed by rubric dimension");
  }

  const levelsByDimension = {};
  const dimensionRecords = [];
  const strengths = [];
  const weaknesses = [];
  const rejected = [];

  for (const dimension of ANALYSIS_DIMENSIONS) {
    const raw = rawDimensions[dimension.key];

    if (!raw || typeof raw !== "object") {
      throw new Error(`dimensions.${dimension.key} is missing`);
    }

    const level = String(raw.level ?? "").trim().toLowerCase();

    if (!AvailableAnalysisLevels.includes(level)) {
      throw new Error(
        `dimensions.${dimension.key}.level must be one of: ${AvailableAnalysisLevels.join(", ")}`,
      );
    }

    levelsByDimension[dimension.key] = level;

    const strength = normalizeFinding({
      finding: raw.strength,
      dimension,
      findingType: "strength",
      resumeTextNormalized,
      rejected,
    });

    const weakness = normalizeFinding({
      finding: raw.weakness,
      dimension,
      findingType: "weakness",
      resumeTextNormalized,
      rejected,
    });

    // A low-rated dimension has to say what is wrong, and a high-rated one has
    // to say what is right. Without this the model drifts toward reporting only
    // the findings it finds easiest to write.
    if (isWeaknessRequiredLevel(level) && !weakness) {
      rejected.push(`${dimension.key}: level "${level}" reported no usable weakness`);
    }

    if (!isWeaknessRequiredLevel(level) && !strength) {
      rejected.push(`${dimension.key}: level "${level}" reported no usable strength`);
    }

    if (strength) {
      strengths.push(strength);
    }

    if (weakness) {
      weaknesses.push(weakness);
    }

    dimensionRecords.push({
      key: dimension.key,
      label: dimension.label,
      weight: dimension.weight,
      level,
      evidenceVerified: Boolean(strength || weakness),
    });
  }

  // A run where nothing survived verification is a failed run, not an empty
  // one - surfacing blank findings would hide the regression.
  if (!strengths.length && !weaknesses.length) {
    throw new Error(
      `No analysis finding passed evidence verification (${rejected.join("; ") || "no findings returned"})`,
    );
  }

  const overallScore = computeOverallScore(levelsByDimension);

  const recommendationDetails = normalizeRecommendations({
    raw: payload.recommendations,
    levelsByDimension,
    resumeTextNormalized,
    rejected,
  });

  return {
    overallScore,
    scoreBand: getScoreBand(overallScore),
    dimensions: dimensionRecords,
    strengthDetails: strengths,
    weaknessDetails: weaknesses,
    recommendationDetails,
    // Legacy flat arrays, kept populated so existing API consumers and the
    // Postman collection keep working while clients migrate to the details.
    strengths: strengths.map((item) => item.observation),
    weaknesses: weaknesses.map((item) => item.observation),
    recommendations: recommendationDetails.map((item) => item.action),
    rubricVersion: ANALYSIS_RUBRIC_VERSION,
    rejectedFindings: rejected,
  };
};

const serializeFinding = (finding) => ({
  dimension: finding.dimension,
  dimensionLabel: finding.dimensionLabel,
  observation: finding.observation,
  evidenceType: finding.evidenceType,
  evidenceText: finding.evidenceText,
  impact: finding.impact,
});

export const serializeAnalysis = (analysis) => ({
  analysisId: analysis._id,
  resumeId: analysis.resume,
  status: analysis.status,
  overallScore: analysis.overallScore ?? null,
  scoreBand: analysis.scoreBand || null,
  dimensions: (analysis.dimensions ?? []).map((dimension) => ({
    key: dimension.key,
    label: dimension.label,
    weight: dimension.weight,
    level: dimension.level,
    evidenceVerified: dimension.evidenceVerified,
  })),
  strengths: analysis.strengths,
  weaknesses: analysis.weaknesses,
  strengthDetails: (analysis.strengthDetails ?? []).map(serializeFinding),
  weaknessDetails: (analysis.weaknessDetails ?? []).map(serializeFinding),
  recommendations: analysis.recommendations,
  recommendationDetails: (analysis.recommendationDetails ?? []).map(
    (recommendation) => ({
      dimension: recommendation.dimension,
      dimensionLabel: recommendation.dimensionLabel,
      action: recommendation.action,
      rewrite: recommendation.rewrite,
      evidenceType: recommendation.evidenceType,
      evidenceText: recommendation.evidenceText,
      scoreUpside: recommendation.scoreUpside,
      priority: recommendation.priority,
    }),
  ),
  aiModel: analysis.aiModel,
  rubricVersion: analysis.rubricVersion || null,
  promptVersion: analysis.promptVersion || null,
  errorMessage: analysis.errorMessage || null,
  createdAt: analysis.createdAt,
  updatedAt: analysis.updatedAt,
});

export { EvidenceTypeEnum };
