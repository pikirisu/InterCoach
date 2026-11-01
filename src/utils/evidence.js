// Every finding the model reports has to point at something checkable in the
// resume. A "quote" finding must appear in the extracted text; an "absence"
// finding must NOT appear. Findings that fail the check are dropped, which is
// what stops the model from emitting advice that would fit any resume.

export const EvidenceTypeEnum = {
  QUOTE: "quote",
  ABSENCE: "absence",
};

export const AvailableEvidenceTypes = Object.values(EvidenceTypeEnum);

const MIN_QUOTE_WORDS = 3;
const MAX_QUOTE_WORDS = 20;
const MAX_ABSENCE_WORDS = 6;

// A recommendation points at the line it wants changed, and that line is often a
// section heading ("EDUCATION B.Tech"). Three words would reject legitimate
// structural advice, so the floor drops by one here - still enough that a single
// common word cannot pass as a target.
export const MIN_RECOMMENDATION_QUOTE_WORDS = 2;

/**
 * Collapses the differences PDF extraction introduces - smart quotes, ligature
 * spacing, punctuation, line breaks - so a faithful quote still matches, while
 * the actual words and their order still have to be right.
 */
export const normalizeForEvidence = (value) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const countWords = (normalized) => (normalized ? normalized.split(" ").length : 0);

/**
 * @returns {{ ok: boolean, reason: string }}
 */
export const verifyEvidence = ({
  resumeTextNormalized,
  evidenceType,
  evidenceText,
  minQuoteWords = MIN_QUOTE_WORDS,
}) => {
  if (!AvailableEvidenceTypes.includes(evidenceType)) {
    return { ok: false, reason: `unknown evidenceType "${evidenceType}"` };
  }

  const normalized = normalizeForEvidence(evidenceText);

  if (!normalized) {
    return { ok: false, reason: "empty evidence" };
  }

  const wordCount = countWords(normalized);

  if (evidenceType === EvidenceTypeEnum.QUOTE) {
    if (wordCount < minQuoteWords) {
      return { ok: false, reason: `quote shorter than ${minQuoteWords} words` };
    }

    if (wordCount > MAX_QUOTE_WORDS) {
      return { ok: false, reason: `quote longer than ${MAX_QUOTE_WORDS} words` };
    }

    if (!resumeTextNormalized.includes(normalized)) {
      return { ok: false, reason: "quote not found in resume text" };
    }

    return { ok: true, reason: "" };
  }

  if (wordCount > MAX_ABSENCE_WORDS) {
    return { ok: false, reason: `absence term longer than ${MAX_ABSENCE_WORDS} words` };
  }

  if (resumeTextNormalized.includes(normalized)) {
    return { ok: false, reason: "term claimed absent is present in resume text" };
  }

  return { ok: true, reason: "" };
};
