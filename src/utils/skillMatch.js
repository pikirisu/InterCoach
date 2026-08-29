const MUST_HAVE_WEIGHT = 70;
const NICE_TO_HAVE_WEIGHT = 30;

export const normalizeSkillTerm = (term) => String(term ?? "").trim();

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const resumeContainsSkill = (resumeTextLower, skillTerm) => {
  const normalizedTerm = normalizeSkillTerm(skillTerm).toLowerCase();

  if (!normalizedTerm) {
    return false;
  }

  if (normalizedTerm.includes(" ")) {
    return resumeTextLower.includes(normalizedTerm);
  }

  const wordBoundaryPattern = new RegExp(`\\b${escapeRegExp(normalizedTerm)}\\b`, "i");
  return wordBoundaryPattern.test(resumeTextLower);
};

const splitSkills = (skills, resumeTextLower) => {
  const matched = [];
  const missing = [];

  for (const skill of skills) {
    const term = normalizeSkillTerm(skill);

    if (!term) {
      continue;
    }

    if (resumeContainsSkill(resumeTextLower, term)) {
      matched.push(term);
    } else {
      missing.push(term);
    }
  }

  return { matched, missing };
};

export const computeMatchScore = ({
  mustHaveSkills = [],
  niceToHaveSkills = [],
  resumeText = "",
}) => {
  const resumeTextLower = resumeText.toLowerCase();
  const mustHave = splitSkills(mustHaveSkills, resumeTextLower);
  const niceToHave = splitSkills(niceToHaveSkills, resumeTextLower);

  const mustHaveTotal = mustHave.matched.length + mustHave.missing.length;
  const niceToHaveTotal = niceToHave.matched.length + niceToHave.missing.length;

  const mustHaveCoverage = mustHaveTotal ? mustHave.matched.length / mustHaveTotal : null;
  const niceToHaveCoverage = niceToHaveTotal ? niceToHave.matched.length / niceToHaveTotal : null;

  let matchScore;

  if (mustHaveCoverage === null && niceToHaveCoverage === null) {
    matchScore = 0;
  } else if (mustHaveCoverage === null) {
    matchScore = niceToHaveCoverage * 100;
  } else if (niceToHaveCoverage === null) {
    matchScore = mustHaveCoverage * 100;
  } else {
    matchScore = mustHaveCoverage * MUST_HAVE_WEIGHT + niceToHaveCoverage * NICE_TO_HAVE_WEIGHT;
  }

  return {
    matchScore: Math.max(0, Math.min(100, Math.round(matchScore))),
    matchedSkills: [...mustHave.matched, ...niceToHave.matched],
    missingSkills: [...mustHave.missing, ...niceToHave.missing],
  };
};
