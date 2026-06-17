/**
 * Simple wrapper around the Groq API (or any OpenAI‑compatible endpoint).
 * The wrapper is deliberately lightweight – it only handles JSON payloads,
 * adds the required Authorization header, and returns the parsed response.
 *
 * Environment variable `GROQ_API_KEY` must be defined in `.env.local`.
 * The default model is `llama-3.1-70b-versatile` which is available on the
 * free tier of Groq. If you prefer another provider (e.g., NVIDIA NIM or
 * Google Gemini) you can change the `BASE_URL` and payload shape accordingly.
 */

const BASE_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * Generic request to the LLM service.
 * @param {string} systemPrompt – System level instruction for the model.
 * @param {string} userPrompt   – User supplied content (profile, resume, …).
 * @param {object} [options]    – Optional overrides (model, temperature).
 * @returns {Promise<any>}      – Parsed JSON response from the model.
 */
export async function callLLM(systemPrompt, userPrompt, options = {}) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set. Add it to .env.local");
  }

  const payload = {
    model: options.model || "llama-3.1-70b-versatile",
    temperature: options.temperature ?? 0.7,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]
  };

  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`LLM request failed: ${response.status} ${err}`);
  }

  const data = await response.json();
  // Groq follows the OpenAI schema – the assistant message is in `choices[0].message.content`
  const content = data?.choices?.[0]?.message?.content;
  try {
    // Most prompts will ask the model to return JSON, so attempt to parse.
    return JSON.parse(content);
  } catch {
    // If parsing fails, just return the raw string – callers can handle it.
    return content;
  }
}

/**
 * Helper to generate mentor insights using the LLM.
 * @param {object} analysis – The full analysis object produced by `analyzeCareerProfile`.
 * @returns {Promise<object>} – { paragraphs: string[], highlight: object }
 */
export async function generateMentorInsights(analysis) {
  const system = "You are a career‑guidance AI mentor. Provide concise, friendly paragraphs that summarize the user's strengths, gaps, and next steps. Return a JSON object with two keys: `paragraphs` (array of strings) and `highlight` (object containing `topCareer`, `readinessScore`, `topGaps`, `estimatedWeeks`).";
  const user = JSON.stringify(analysis, null, 2);
  return await callLLM(system, user);
}

/**
 * Helper to analyse a resume text with the LLM.
 * @param {string} resumeText – Raw resume text.
 * @param {string} targetCareer – Desired career role.
 * @returns {Promise<object>} – Same shape as `analyzeResumeText` but enriched.
 */
export async function generateResumeAnalysis(resumeText, targetCareer) {
  const system = "You are a resume analyst for a career‑guidance platform. Extract detected skills, strengths, missing skills, and give concise recommendations. Return a JSON object matching the shape of the existing `analyzeResumeText` output.";
  const user = `Target career: ${targetCareer}\n\nResume:\n${resumeText}`;
  return await callLLM(system, user);
}
