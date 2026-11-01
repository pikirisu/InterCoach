import assert from "node:assert/strict";
import test from "node:test";

import {
  ANALYSIS_DIMENSIONS,
  computeOverallScore,
  computeScoreUpside,
  getScoreBand,
  MAX_RECOMMENDATIONS,
} from "../src/utils/analysisRubric.js";
import { normalizeForEvidence, verifyEvidence } from "../src/utils/evidence.js";
import { normalizeAnalysisPayload } from "../src/modules/analysis/analysis.validation.js";

const RESUME_TEXT = `
Akshat Chaurasia
Backend Engineer

EXPERIENCE
Cut checkout API p95 latency from 820ms to 210ms across 12 services
Worked on backend APIs and helped the team with various tasks

SKILLS
Node.js, Express, MongoDB, Docker
`;

const RESUME_NORMALIZED = normalizeForEvidence(RESUME_TEXT);

const strengthFinding = () => ({
  observation: "Lead bullet states a measured latency improvement.",
  evidenceType: "quote",
  evidenceText: "Cut checkout API p95 latency from 820ms to 210ms",
  impact: "Shows the candidate can move a production metric.",
});

const weaknessFinding = () => ({
  observation: "A duty-listing bullet carries no outcome.",
  evidenceType: "quote",
  evidenceText: "Worked on backend APIs",
  impact: "Reads as filler next to the quantified bullet above it.",
});

const recommendation = (overrides = {}) => ({
  dimension: "impact",
  action: "Replace the duty bullet with the outcome it produced.",
  evidenceType: "quote",
  evidenceText: "Worked on backend APIs",
  rewrite: "Rebuilt 4 backend APIs, cutting p95 latency 74%.",
  ...overrides,
});

const buildPayload = (levels, overrides = {}) => {
  const dimensions = {};

  for (const dimension of ANALYSIS_DIMENSIONS) {
    const level = levels[dimension.key];
    const isLow = level === "weak" || level === "adequate";

    dimensions[dimension.key] = overrides[dimension.key] ?? {
      level,
      strength: isLow ? null : strengthFinding(),
      weakness: isLow ? weaknessFinding() : null,
    };
  }

  return {
    dimensions,
    recommendations: [recommendation()],
  };
};

const allLevels = (level) =>
  Object.fromEntries(ANALYSIS_DIMENSIONS.map((d) => [d.key, level]));

test("rubric weights total 100", () => {
  const total = ANALYSIS_DIMENSIONS.reduce((sum, d) => sum + d.weight, 0);
  assert.equal(total, 100);
});

test("computeOverallScore is deterministic and spans the full range", () => {
  assert.equal(computeOverallScore(allLevels("weak")), 0);
  assert.equal(computeOverallScore(allLevels("exceptional")), 100);

  const mixed = {
    impact: "strong",
    technicalDepth: "strong",
    roleRelevance: "adequate",
    structure: "exceptional",
    progression: "weak",
    signalQuality: "adequate",
  };

  // 25*2/3 + 20*2/3 + 15*1/3 + 15*3/3 + 15*0/3 + 10*1/3 = 53.33 -> 53
  assert.equal(computeOverallScore(mixed), 53);

  for (let i = 0; i < 25; i += 1) {
    assert.equal(computeOverallScore(mixed), 53);
  }
});

test("computeOverallScore rejects a missing dimension", () => {
  const levels = allLevels("strong");
  delete levels.impact;

  assert.throws(() => computeOverallScore(levels), /impact/);
});

test("score bands map to the expected labels", () => {
  assert.equal(getScoreBand(0), "Needs work");
  assert.equal(getScoreBand(39), "Needs work");
  assert.equal(getScoreBand(40), "Developing");
  assert.equal(getScoreBand(60), "Solid");
  assert.equal(getScoreBand(75), "Strong");
  assert.equal(getScoreBand(100), "Exceptional");
});

test("evidence verification accepts a faithful quote", () => {
  const result = verifyEvidence({
    resumeTextNormalized: RESUME_NORMALIZED,
    evidenceType: "quote",
    evidenceText: "Cut checkout API p95 latency from 820ms to 210ms",
  });

  assert.equal(result.ok, true);
});

test("evidence verification tolerates punctuation and spacing drift", () => {
  const result = verifyEvidence({
    resumeTextNormalized: RESUME_NORMALIZED,
    evidenceType: "quote",
    evidenceText: "Node.js,   Express,  MongoDB",
  });

  assert.equal(result.ok, true);
});

test("evidence verification rejects a fabricated quote", () => {
  const result = verifyEvidence({
    resumeTextNormalized: RESUME_NORMALIZED,
    evidenceType: "quote",
    evidenceText: "Led a team of fifteen engineers",
  });

  assert.equal(result.ok, false);
  assert.match(result.reason, /not found/);
});

test("evidence verification rejects quotes that are too short", () => {
  const result = verifyEvidence({
    resumeTextNormalized: RESUME_NORMALIZED,
    evidenceType: "quote",
    evidenceText: "Docker",
  });

  assert.equal(result.ok, false);
  assert.match(result.reason, /shorter than/);
});

test("evidence verification accepts a genuine absence and rejects a false one", () => {
  assert.equal(
    verifyEvidence({
      resumeTextNormalized: RESUME_NORMALIZED,
      evidenceType: "absence",
      evidenceText: "Kubernetes",
    }).ok,
    true,
  );

  const falseAbsence = verifyEvidence({
    resumeTextNormalized: RESUME_NORMALIZED,
    evidenceType: "absence",
    evidenceText: "Docker",
  });

  assert.equal(falseAbsence.ok, false);
  assert.match(falseAbsence.reason, /is present/);
});

test("normalizeAnalysisPayload derives the score from levels, not from the model", () => {
  const payload = buildPayload(allLevels("strong"));
  // A model-supplied score must be ignored entirely.
  payload.overallScore = 12;

  const result = normalizeAnalysisPayload(payload, { resumeText: RESUME_TEXT });

  assert.equal(result.overallScore, 67);
  assert.equal(result.scoreBand, "Solid");
  assert.equal(result.dimensions.length, ANALYSIS_DIMENSIONS.length);
});

test("normalizeAnalysisPayload keeps the legacy flat arrays populated", () => {
  const result = normalizeAnalysisPayload(buildPayload(allLevels("strong")), {
    resumeText: RESUME_TEXT,
  });

  assert.equal(result.strengths.length, result.strengthDetails.length);
  assert.equal(result.strengths[0], result.strengthDetails[0].observation);
  assert.deepEqual(result.recommendations, [recommendation().action]);
  assert.equal(result.recommendations[0], result.recommendationDetails[0].action);
});

test("normalizeAnalysisPayload drops findings whose evidence fails verification", () => {
  const payload = buildPayload(allLevels("strong"), {
    impact: {
      level: "strong",
      strength: {
        ...strengthFinding(),
        evidenceText: "Scaled the platform to ten million users",
      },
      weakness: null,
    },
  });

  const result = normalizeAnalysisPayload(payload, { resumeText: RESUME_TEXT });

  assert.equal(result.strengthDetails.length, ANALYSIS_DIMENSIONS.length - 1);
  assert.ok(result.strengthDetails.every((item) => item.dimension !== "impact"));
  assert.match(result.rejectedFindings.join(" "), /impact/);

  // The dropped finding must not change the score.
  assert.equal(result.overallScore, 67);
  assert.equal(
    result.dimensions.find((item) => item.key === "impact").evidenceVerified,
    false,
  );
});

test("normalizeAnalysisPayload fails when no finding survives verification", () => {
  const fabricated = {
    observation: "Generic praise.",
    evidenceType: "quote",
    evidenceText: "Scaled the platform to ten million users",
    impact: "None.",
  };

  const overrides = Object.fromEntries(
    ANALYSIS_DIMENSIONS.map((d) => [
      d.key,
      { level: "strong", strength: fabricated, weakness: null },
    ]),
  );

  assert.throws(
    () =>
      normalizeAnalysisPayload(buildPayload(allLevels("strong"), overrides), {
        resumeText: RESUME_TEXT,
      }),
    /evidence verification/,
  );
});

test("normalizeAnalysisPayload rejects an invalid level", () => {
  const payload = buildPayload(allLevels("strong"));
  payload.dimensions.impact.level = "excellent";

  assert.throws(
    () => normalizeAnalysisPayload(payload, { resumeText: RESUME_TEXT }),
    /level must be one of/,
  );
});

test("normalizeAnalysisPayload requires resume text to verify against", () => {
  assert.throws(
    () => normalizeAnalysisPayload(buildPayload(allLevels("strong")), {}),
    /Resume text is required/,
  );
});

test("computeScoreUpside returns the points still recoverable in a dimension", () => {
  // impact is weighted 25, so a weak rating leaves all 25 on the table.
  assert.equal(computeScoreUpside("impact", "weak"), 25);
  assert.equal(computeScoreUpside("impact", "adequate"), 17);
  assert.equal(computeScoreUpside("impact", "strong"), 8);
  assert.equal(computeScoreUpside("impact", "exceptional"), 0);

  // signalQuality is weighted 10, so even a weak rating is worth less than a
  // merely strong impact rating - which is exactly why ranking is code's job.
  assert.equal(computeScoreUpside("signalQuality", "weak"), 10);
  assert.equal(computeScoreUpside("unknownDimension", "weak"), 0);
});

test("recommendations are ranked by recoverable score, not by model order", () => {
  const levels = {
    ...allLevels("strong"),
    structure: "weak",
    signalQuality: "weak",
  };
  const payload = buildPayload(levels);

  // Deliberately emitted lowest-value first.
  payload.recommendations = [
    recommendation({ dimension: "impact", evidenceText: "Worked on backend APIs" }),
    recommendation({
      dimension: "signalQuality",
      evidenceText: "helped the team with various tasks",
      rewrite: "",
    }),
    recommendation({
      dimension: "structure",
      evidenceType: "absence",
      evidenceText: "Kubernetes",
      rewrite: "",
    }),
  ];

  const result = normalizeAnalysisPayload(payload, { resumeText: RESUME_TEXT });

  assert.deepEqual(
    result.recommendationDetails.map((item) => item.dimension),
    ["structure", "signalQuality", "impact"],
  );
  assert.deepEqual(
    result.recommendationDetails.map((item) => item.scoreUpside),
    [15, 10, 8],
  );
  assert.deepEqual(
    result.recommendationDetails.map((item) => item.priority),
    ["high", "medium", "medium"],
  );

  // The flat array follows the same ranking.
  assert.equal(result.recommendations.length, 3);
});

test("recommendation ranking is stable across repeated runs", () => {
  const payload = buildPayload(allLevels("adequate"));
  payload.recommendations = [
    recommendation({ dimension: "signalQuality", evidenceType: "absence", evidenceText: "Kafka", rewrite: "" }),
    recommendation({ dimension: "impact", evidenceType: "absence", evidenceText: "Terraform", rewrite: "" }),
    recommendation({ dimension: "structure", evidenceType: "absence", evidenceText: "GraphQL", rewrite: "" }),
  ];

  const first = normalizeAnalysisPayload(payload, { resumeText: RESUME_TEXT });

  for (let i = 0; i < 10; i += 1) {
    const repeat = normalizeAnalysisPayload(payload, { resumeText: RESUME_TEXT });
    assert.deepEqual(repeat.recommendationDetails, first.recommendationDetails);
  }
});

test("a plain-string recommendation is rejected without failing the analysis", () => {
  const payload = buildPayload(allLevels("strong"));
  payload.recommendations = [
    "Use strong action verbs throughout your resume.",
    "Tailor your resume to each role you apply for.",
  ];

  const result = normalizeAnalysisPayload(payload, { resumeText: RESUME_TEXT });

  assert.deepEqual(result.recommendationDetails, []);
  assert.deepEqual(result.recommendations, []);
  assert.match(result.rejectedFindings.join(" "), /evidence-bound/);
  // The score and findings are unaffected.
  assert.equal(result.overallScore, 67);
  assert.equal(result.strengthDetails.length, ANALYSIS_DIMENSIONS.length);
});

test("recommendation evidence is verified against the resume", () => {
  const payload = buildPayload(allLevels("strong"));
  payload.recommendations = [
    recommendation({ evidenceText: "Led a team of fifteen engineers" }),
    recommendation({
      dimension: "structure",
      evidenceType: "absence",
      evidenceText: "Docker",
      rewrite: "",
    }),
    recommendation({ dimension: "notADimension", evidenceText: "Worked on backend APIs" }),
  ];

  const result = normalizeAnalysisPayload(payload, { resumeText: RESUME_TEXT });

  assert.deepEqual(result.recommendationDetails, []);

  const rejections = result.rejectedFindings.join(" ");
  assert.match(rejections, /quote not found in resume text/);
  assert.match(rejections, /claimed absent is present/);
  assert.match(rejections, /unknown dimension "notADimension"/);
});

test("recommendations may target a two-word span that a finding could not", () => {
  // "Backend Engineer" is a real line, but too short to qualify as finding
  // evidence. Recommendations need it so they can point at section headings.
  assert.equal(
    verifyEvidence({
      resumeTextNormalized: RESUME_NORMALIZED,
      evidenceType: "quote",
      evidenceText: "Backend Engineer",
    }).ok,
    false,
  );

  const payload = buildPayload(allLevels("strong"));
  payload.recommendations = [
    recommendation({
      dimension: "roleRelevance",
      evidenceText: "Backend Engineer",
      rewrite: "Backend Engineer — Distributed Systems & APIs",
    }),
  ];

  const result = normalizeAnalysisPayload(payload, { resumeText: RESUME_TEXT });

  assert.equal(result.recommendationDetails.length, 1);
  assert.equal(result.recommendationDetails[0].evidenceText, "Backend Engineer");
});

test("a repeated recommendation target is dropped", () => {
  const payload = buildPayload(allLevels("strong"));
  payload.recommendations = [
    recommendation(),
    recommendation({ action: "Say the same thing a second time." }),
  ];

  const result = normalizeAnalysisPayload(payload, { resumeText: RESUME_TEXT });

  assert.equal(result.recommendationDetails.length, 1);
  assert.equal(result.recommendationDetails[0].action, recommendation().action);
  assert.match(result.rejectedFindings.join(" "), /repeats an earlier target/);
});

test("recommendations are capped and the cut is deterministic", () => {
  const absentTerms = [
    "Kubernetes",
    "Terraform",
    "GraphQL",
    "Redis",
    "Kafka",
    "Rust",
    "Elixir",
    "Scala",
  ];

  const payload = buildPayload(allLevels("strong"));
  // All on one dimension, so every upside ties and only emission order can
  // decide the cut.
  payload.recommendations = absentTerms.map((term) =>
    recommendation({ evidenceType: "absence", evidenceText: term, rewrite: "" }),
  );

  const result = normalizeAnalysisPayload(payload, { resumeText: RESUME_TEXT });

  assert.equal(result.recommendationDetails.length, MAX_RECOMMENDATIONS);
  assert.deepEqual(
    result.recommendationDetails.map((item) => item.evidenceText),
    absentTerms.slice(0, MAX_RECOMMENDATIONS),
  );
});

test("normalizeAnalysisPayload rejects a non-array recommendations field", () => {
  const payload = buildPayload(allLevels("strong"));
  payload.recommendations = "Rewrite the summary.";

  assert.throws(
    () => normalizeAnalysisPayload(payload, { resumeText: RESUME_TEXT }),
    /recommendations must be an array/,
  );
});
