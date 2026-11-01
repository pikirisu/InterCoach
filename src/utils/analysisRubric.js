// The rubric is the single source of truth for resume analysis: it builds the
// prompt sent to the model AND computes the score from what the model returns.
// The model only ever picks an ordinal level per dimension - the 0-100 number is
// derived here, in code, the same way `skillMatch.js` derives the match score.

export const ANALYSIS_RUBRIC_VERSION = "1.0.0";
export const ANALYSIS_PROMPT_VERSION = "3.0.0";

export const AnalysisLevelEnum = {
  WEAK: "weak",
  ADEQUATE: "adequate",
  STRONG: "strong",
  EXCEPTIONAL: "exceptional",
};

export const AvailableAnalysisLevels = Object.values(AnalysisLevelEnum);

// Ordinal, not numeric: models are far more stable picking one of four labelled
// buckets than estimating a free-form 0-100 score.
const LEVEL_POINTS = {
  [AnalysisLevelEnum.WEAK]: 0,
  [AnalysisLevelEnum.ADEQUATE]: 1,
  [AnalysisLevelEnum.STRONG]: 2,
  [AnalysisLevelEnum.EXCEPTIONAL]: 3,
};

const MAX_LEVEL_POINTS = 3;

// Levels at or below this must report a weakness; levels above it must report a
// strength. Keeps the findings tied to the score instead of floating free.
const WEAKNESS_REQUIRED_LEVELS = [
  AnalysisLevelEnum.WEAK,
  AnalysisLevelEnum.ADEQUATE,
];

export const ANALYSIS_DIMENSIONS = [
  {
    key: "impact",
    label: "Impact & Quantification",
    weight: 25,
    description:
      "Whether bullets state measurable outcomes rather than listing duties.",
    anchors: {
      weak: "Bullets describe responsibilities only. Almost no numbers, scale, or outcomes.",
      adequate:
        "A minority of bullets carry numbers, or numbers are present but vague (\"improved performance\").",
      strong:
        "Most bullets pair an action with a concrete result, metric, or scale.",
      exceptional:
        "Nearly every bullet quantifies outcome and scope, with baselines that make the numbers meaningful.",
    },
  },
  {
    key: "technicalDepth",
    label: "Technical Depth",
    weight: 20,
    description:
      "Whether the technical work described shows real depth, or only tool name-dropping.",
    anchors: {
      weak: "A list of technologies with no evidence of how they were used.",
      adequate:
        "Tools are tied to projects, but the described work stays at surface level.",
      strong:
        "Specific technical decisions, trade-offs, or non-trivial problems are described.",
      exceptional:
        "Demonstrates ownership of complex systems, with architecture or trade-off reasoning made explicit.",
    },
  },
  {
    key: "roleRelevance",
    label: "Role Relevance",
    weight: 15,
    description:
      "Whether the content is focused on a coherent target role rather than everything the candidate has ever done.",
    anchors: {
      weak: "Unfocused. Reads as a history dump with no clear target role.",
      adequate:
        "A target role is inferable, but unrelated content takes significant space.",
      strong:
        "Content is consistently aimed at one clear role; irrelevant material is minimal.",
      exceptional:
        "Every section reinforces one target role, with the most relevant evidence placed first.",
    },
  },
  {
    key: "structure",
    label: "Structure & Readability",
    weight: 15,
    description:
      "Section organisation, bullet length, ordering, and scannability.",
    anchors: {
      weak: "Missing or disordered sections, wall-of-text bullets, hard to scan.",
      adequate:
        "Standard sections present, but ordering or bullet length hurts scanning.",
      strong:
        "Clear sections in sensible order, bullets tight and consistently formatted.",
      exceptional:
        "Reads cleanly in a six-second scan; hierarchy and ordering deliberately guide the reader.",
    },
  },
  {
    key: "progression",
    label: "Career Progression",
    weight: 15,
    description:
      "Whether the timeline shows growth in scope and responsibility, and is free of unexplained gaps.",
    anchors: {
      weak: "No dates, unexplained gaps, or no discernible growth in scope.",
      adequate:
        "Timeline is readable but scope looks flat across roles.",
      strong:
        "Clear upward movement in responsibility, ownership, or scope over time.",
      exceptional:
        "Strong, well-paced trajectory with each role visibly larger in scope than the last.",
    },
  },
  {
    key: "signalQuality",
    label: "Signal Quality & ATS Readiness",
    weight: 10,
    description:
      "Filler, cliches, buzzwords without backing, and machine-parseability of the text.",
    anchors: {
      weak: "Dominated by cliches and unbacked claims (\"team player\", \"hard worker\").",
      adequate: "Some filler and generic phrasing dilute the real content.",
      strong: "Mostly concrete language; contact details and headings parse cleanly.",
      exceptional:
        "Every line carries information. No filler, and the text layer is cleanly machine-readable.",
    },
  },
];

export const ANALYSIS_DIMENSION_KEYS = ANALYSIS_DIMENSIONS.map(
  (dimension) => dimension.key,
);

const DIMENSIONS_BY_KEY = new Map(
  ANALYSIS_DIMENSIONS.map((dimension) => [dimension.key, dimension]),
);

export const getAnalysisDimension = (key) => DIMENSIONS_BY_KEY.get(key) ?? null;

export const isWeaknessRequiredLevel = (level) =>
  WEAKNESS_REQUIRED_LEVELS.includes(level);

export const getLevelPoints = (level) => LEVEL_POINTS[level];

const SCORE_BANDS = [
  { min: 90, label: "Exceptional" },
  { min: 75, label: "Strong" },
  { min: 60, label: "Solid" },
  { min: 40, label: "Developing" },
  { min: 0, label: "Needs work" },
];

export const getScoreBand = (score) =>
  SCORE_BANDS.find((band) => score >= band.min)?.label ?? "Needs work";

export const MAX_RECOMMENDATIONS = 6;

export const RecommendationPriorityEnum = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
};

export const AvailableRecommendationPriorities = Object.values(
  RecommendationPriorityEnum,
);

// Thresholds are in score points, so they stay meaningful if a weight changes.
const PRIORITY_BANDS = [
  { min: 12, label: RecommendationPriorityEnum.HIGH },
  { min: 5, label: RecommendationPriorityEnum.MEDIUM },
  { min: 0, label: RecommendationPriorityEnum.LOW },
];

/**
 * Score points still recoverable in a dimension: its full weight when the level
 * is weak, zero when it is already exceptional.
 *
 * This is what ranks the recommendations. Advice aimed at a heavy dimension that
 * scored badly is worth more than advice aimed at one already near the ceiling,
 * and because it comes out of the same weights as `computeOverallScore`, the
 * ordering can never disagree with the score the user is looking at.
 */
export const computeScoreUpside = (dimensionKey, level) => {
  const dimension = DIMENSIONS_BY_KEY.get(dimensionKey);
  const points = LEVEL_POINTS[level];

  if (!dimension || points === undefined) {
    return 0;
  }

  return Math.round(
    ((MAX_LEVEL_POINTS - points) / MAX_LEVEL_POINTS) * dimension.weight,
  );
};

export const getPriorityBand = (scoreUpside) =>
  PRIORITY_BANDS.find((band) => scoreUpside >= band.min)?.label ??
  RecommendationPriorityEnum.LOW;

/**
 * Deterministic weighted score. Same levels in, same score out - always.
 * Every rubric dimension must be present, so the weights always total 100.
 */
export const computeOverallScore = (levelsByDimension = {}) => {
  let weightedPoints = 0;

  for (const dimension of ANALYSIS_DIMENSIONS) {
    const level = levelsByDimension[dimension.key];
    const points = LEVEL_POINTS[level];

    if (points === undefined) {
      throw new Error(`Missing or invalid level for dimension "${dimension.key}"`);
    }

    weightedPoints += (points / MAX_LEVEL_POINTS) * dimension.weight;
  }

  return Math.max(0, Math.min(100, Math.round(weightedPoints)));
};
