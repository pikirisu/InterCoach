import { normalizeAnalysisPayload } from "../../modules/analysis/analysis.validation.js";
import { normalizeJdRequirementsPayload } from "../../modules/jobDescription/jobDescription.validation.js";
import { normalizeMatchRecommendationsPayload } from "../../modules/match/match.validation.js";

const AI_PROVIDERS = {
  OPENAI: "openai",
  GEMINI: "gemini",
};

const DEFAULT_MODELS = {
  [AI_PROVIDERS.OPENAI]: "gpt-4.1-mini",
  [AI_PROVIDERS.GEMINI]: "gemini-2.5-flash",
};

const ANALYSIS_PROMPT = `
Analyze the following resume text and respond with strict JSON.

Required JSON shape:
{
  "overallScore": number from 0 to 100,
  "strengths": ["short bullet", "short bullet"],
  "weaknesses": ["short bullet", "short bullet"],
  "recommendations": ["actionable bullet", "actionable bullet"]
}

Rules:
- Do not include markdown or code fences.
- Keep each string concise and specific.
- Focus on resume quality, clarity, impact, structure, and relevance.
`;

const JD_EXTRACTION_PROMPT = `
Extract structured hiring requirements from the following job description and respond with strict JSON.

Required JSON shape:
{
  "mustHaveSkills": ["short canonical skill", "short canonical skill"],
  "niceToHaveSkills": ["short canonical skill", "short canonical skill"],
  "keyResponsibilities": ["short bullet", "short bullet"]
}

Rules:
- Do not include markdown or code fences.
- Use short canonical skill/technology names (e.g. "React", "AWS", "SQL"), not full sentences.
- List at most 15 items per array, no duplicates.
- Only include skills explicitly required or preferred by the posting, not inferred ones.
`;

const MATCH_RECOMMENDATIONS_PROMPT = `
A candidate's resume is being compared against a job description. The match score and matched/missing
skills provided below were already computed by deterministic code, not by you - do not recompute,
restate, or contradict them.

Respond with strict JSON:
{
  "recommendations": ["actionable bullet", "actionable bullet"]
}

Rules:
- Do not include markdown or code fences.
- Give specific phrasing/placement guidance for closing the gaps in the missing-skills list.
- Do not simply repeat the missing-skills list as the only content.
- Keep each bullet concise and specific, at most 8 bullets.
`;

const buildMatchRecommendationsContent = ({
  resumeText,
  jobDescriptionText,
  matchedSkills,
  missingSkills,
  matchScore,
}) => `
Match score: ${matchScore}/100
Matched skills: ${matchedSkills.join(", ") || "none"}
Missing skills: ${missingSkills.join(", ") || "none"}

Job description:
${jobDescriptionText}

Resume:
${resumeText}
`;

const getConfiguredProvider = () =>
  (process.env.AI_PROVIDER || AI_PROVIDERS.OPENAI).toLowerCase();

export const getConfiguredAIModel = () => {
  const provider = getConfiguredProvider();

  if (provider === AI_PROVIDERS.GEMINI) {
    return process.env.GEMINI_MODEL || DEFAULT_MODELS[AI_PROVIDERS.GEMINI];
  }

  return process.env.OPENAI_MODEL || DEFAULT_MODELS[AI_PROVIDERS.OPENAI];
};

const extractJsonText = (value) => {
  if (typeof value !== "string") {
    throw new Error("AI response was not text");
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    throw new Error("AI response was empty");
  }

  const codeFenceMatch = trimmedValue.match(/```(?:json)?\s*([\s\S]*?)```/i);

  if (codeFenceMatch?.[1]) {
    return codeFenceMatch[1].trim();
  }

  return trimmedValue;
};

const parseJsonPayload = (value) => {
  const text = extractJsonText(value);

  try {
    return JSON.parse(text);
  } catch (error) {
    const startIndex = text.indexOf("{");
    const endIndex = text.lastIndexOf("}");

    if (startIndex >= 0 && endIndex > startIndex) {
      return JSON.parse(text.slice(startIndex, endIndex + 1));
    }

    throw error;
  }
};

const callOpenAI = async (systemPrompt, userContent) => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: getConfiguredAIModel(),
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userContent,
        },
      ],
    }),
  });

  const responseBody = await response.json();

  if (!response.ok) {
    const errorMessage =
      responseBody?.error?.message || "OpenAI request failed";
    throw new Error(errorMessage);
  }

  const content = responseBody?.choices?.[0]?.message?.content;
  return parseJsonPayload(content);
};

const callGemini = async (systemPrompt, userContent) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const model = getConfiguredAIModel();
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        generationConfig: {
          responseMimeType: "application/json",
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${systemPrompt}\n\n${userContent}`,
              },
            ],
          },
        ],
      }),
    },
  );

  const responseBody = await response.json();

  if (!response.ok) {
    const errorMessage =
      responseBody?.error?.message || "Gemini request failed";
    throw new Error(errorMessage);
  }

  const content =
    responseBody?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter(Boolean)
      .join("\n") || "";

  return parseJsonPayload(content);
};

const requestJson = async (systemPrompt, userContent) => {
  const provider = getConfiguredProvider();

  if (provider === AI_PROVIDERS.GEMINI) {
    return callGemini(systemPrompt, userContent);
  }

  if (provider === AI_PROVIDERS.OPENAI) {
    return callOpenAI(systemPrompt, userContent);
  }

  throw new Error(`Unsupported AI provider: ${provider}`);
};

export const generateResumeAnalysis = async (resumeText) => {
  const payload = await requestJson(ANALYSIS_PROMPT, resumeText);
  return normalizeAnalysisPayload(payload);
};

export const extractJobRequirements = async (jobDescriptionText) => {
  const payload = await requestJson(JD_EXTRACTION_PROMPT, jobDescriptionText);
  return normalizeJdRequirementsPayload(payload);
};

export const generateMatchRecommendations = async ({
  resumeText,
  jobDescriptionText,
  matchedSkills,
  missingSkills,
  matchScore,
}) => {
  const content = buildMatchRecommendationsContent({
    resumeText,
    jobDescriptionText,
    matchedSkills,
    missingSkills,
    matchScore,
  });
  const payload = await requestJson(MATCH_RECOMMENDATIONS_PROMPT, content);
  return normalizeMatchRecommendationsPayload(payload);
};
