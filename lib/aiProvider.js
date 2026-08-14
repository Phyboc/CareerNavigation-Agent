/**
 * Simple wrapper around the Groq API (or any OpenAI-compatible endpoint).
 * The wrapper is deliberately lightweight – it only handles JSON payloads,
 * adds the required Authorization header, and returns the parsed response.
 *
 * Environment variable `GROQ_API_KEY` must be defined in `.env.local`.
 * The default model is `llama-3.3-70b-versatile` which is available on the
 * free tier of Groq (verified 2026-08; `llama-3.1-70b-versatile` is no
 * longer served by the API and returns HTTP 400). You can override it with
 * the `GROQ_MODEL` environment variable, or switch providers by changing
 * `BASE_URL` and the payload shape accordingly.
 */

const BASE_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";
const REQUEST_TIMEOUT_MS = 20_000;

/**
 * Parse a model response that may contain extra prose or markdown code
 * fences around the JSON payload. Returns the original string if no JSON
 * can be extracted, so callers can fall back gracefully.
 * @param {string} content – Raw assistant message content.
 * @returns {any} Parsed JSON, or the raw string when parsing fails.
 */
function extractJson(content) {
	if (typeof content !== "string") return content;

	// Strip markdown code fences first: ```json\n{...}\n```
	const fenced = content.trim().match(/```(?:json)?\s*([\s\S]*?)```/);
	const candidate = fenced ? fenced[1].trim() : content.trim();

	try {
		return JSON.parse(candidate);
	} catch {
		// Fall back to the first JSON object or array embedded in the text.
		const match = candidate.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
		if (match) {
			try {
				return JSON.parse(match[1]);
			} catch {
				// fall through to returning the raw string
			}
		}
		return content;
	}
}

/**
 * Recursively convert snake_case object keys to camelCase so model output
 * matches the shapes the rest of the app expects. Arrays are left untouched.
 * @param {any} value – Parsed model output.
 * @returns {any} Value with camelCased keys.
 */
function toCamelKeys(value) {
	if (Array.isArray(value)) {
		return value.map(toCamelKeys);
	}
	if (value && typeof value === "object") {
		const result = {};
		for (const [key, val] of Object.entries(value)) {
			const camel = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
			result[camel] = toCamelKeys(val);
		}
		return result;
	}
	return value;
}

/**
 * Generic request to the LLM service.
 * @param {string} systemPrompt – System level instruction for the model.
 * @param {string} userPrompt   – User supplied content (profile, resume, …).
 * @param {object} [options]    – Optional overrides (model, temperature, maxTokens, timeoutMs,
 *                                messages for a full conversation, raw to skip JSON parsing).
 * @returns {Promise<any>}      – Parsed JSON (or raw text when `raw` is set) from the model.
 */
export async function callLLM(systemPrompt, userPrompt, options = {}) {
	const apiKey = process.env.GROQ_API_KEY;
	if (!apiKey) {
		throw new Error("GROQ_API_KEY is not set. Add it to .env.local");
	}

	const payload = {
		model: options.model || process.env.GROQ_MODEL || DEFAULT_MODEL,
		temperature: options.temperature ?? 0.7,
		max_tokens: options.maxTokens ?? 1200,
		// Pass a full conversation when provided, otherwise build system + user.
		messages: options.messages || [
			{ role: "system", content: systemPrompt },
			{ role: "user", content: userPrompt }
		]
	};

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? REQUEST_TIMEOUT_MS);

	let response;
	try {
		response = await fetch(BASE_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${apiKey}`
			},
			body: JSON.stringify(payload),
			signal: controller.signal
		});
	} catch (error) {
		if (error && error.name === "AbortError") {
			throw new Error(`LLM request timed out after ${options.timeoutMs ?? REQUEST_TIMEOUT_MS}ms`);
		}
		throw error;
	} finally {
		clearTimeout(timeout);
	}

	if (!response.ok) {
		// Truncate the upstream error body so failures stay readable.
		const err = (await response.text()).slice(0, 200);
		throw new Error(`LLM request failed: ${response.status} ${err}`);
	}

	const data = await response.json();
	// Groq follows the OpenAI schema – the assistant message is in `choices[0].message.content`.
	const content = data?.choices?.[0]?.message?.content;
	// Chat-style replies are prose, not JSON – return them untouched.
	if (options.raw) return content;
	return extractJson(content);
}

/**
 * Helper to generate mentor insights using the LLM.
 * @param {object} analysis – The full analysis object produced by `analyzeCareerProfile`.
 * @returns {Promise<object>} – { paragraphs: string[], highlight: object }
 */
export async function generateMentorInsights(analysis) {
	const system = "You are a career-guidance AI mentor. Provide concise, friendly paragraphs that summarize the user's strengths, gaps, and next steps. Return a JSON object with two keys: `paragraphs` (array of strings) and `highlight` (object containing `topCareer`, `readinessScore`, `topGaps`, `estimatedWeeks`).";
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
	const system = "You are a resume analyst for a career-guidance platform. Extract detected skills, strengths, missing skills, and give concise recommendations. Return a JSON object with these keys: detectedSkills (array), strengths (array), missingSkills (array), suggestions (array), careerFit (string), matchScore (number).";
	const user = `Target career: ${targetCareer}\n\nResume:\n${resumeText}`;
	const raw = await callLLM(system, user);
	const result = toCamelKeys(raw);

	// Normalize alternate key names the model may produce (snake_case, or
	// detectedStrengths/recommendations instead of strengths/suggestions).
	if (result && typeof result === "object") {
		result.strengths = result.strengths || result.detectedStrengths || [];
		result.suggestions = result.suggestions || result.recommendations || [];
		if (!result.targetCareer) result.targetCareer = targetCareer;

		// Models often return a 0–1 fraction instead of a 0–100 percentage.
		if (typeof result.matchScore === "number") {
			result.matchScore = result.matchScore <= 1
				? Math.round(result.matchScore * 100)
				: Math.round(result.matchScore);
		}

		// Map loose fit phrasing onto the labels the UI already knows.
		const fit = String(result.careerFit || "").toLowerCase();
		if (fit) {
			if (/strong|excellent|great/.test(fit)) result.careerFit = "Strong fit";
			else if (/moderate|partial|average|good|decent|promising/.test(fit)) result.careerFit = "Moderate fit";
			else if (/need|weak|poor|low|develop/.test(fit)) result.careerFit = "Needs development";
		}
	}
	return result;
}
