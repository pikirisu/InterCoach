import { normalizeAnalysisPayload } from "../../modules/analysis/analysis.validation.js";

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

const callOpenAI = async (resumeText) => {
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
          content: ANALYSIS_PROMPT,
        },
        {
          role: "user",
          content: resumeText,
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
  return normalizeAnalysisPayload(parseJsonPayload(content));
};

const callGemini = async (resumeText) => {
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
                text: `${ANALYSIS_PROMPT}\n\nResume text:\n${resumeText}`,
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

  return normalizeAnalysisPayload(parseJsonPayload(content));
};

export const generateResumeAnalysis = async (resumeText) => {
  const provider = getConfiguredProvider();

  if (provider === AI_PROVIDERS.GEMINI) {
    return callGemini(resumeText);
  }

  if (provider === AI_PROVIDERS.OPENAI) {
    return callOpenAI(resumeText);
  }

  throw new Error(`Unsupported AI provider: ${provider}`);
};
