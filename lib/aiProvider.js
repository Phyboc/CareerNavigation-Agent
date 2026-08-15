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

// Set once a daily-token-quota 429 is seen: the account cannot make more
// LLM calls until the quota resets, so every subsequent request fails fast
// (no network round-trip, no pointless retries) and callers fall back to
// the deterministic analyzers without burning time or requests.
let quotaExhausted = false;

/**
 * Detect a daily-token-quota (TPD) 429 and remember it for this server
 * process, so we stop hitting the API for the rest of the day.
 */
function isDailyQuotaError(status, body) {
	return status === 429 && /tokens per day|TPD/i.test(body || "");
}

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

	// Daily quota hit earlier today – fail fast so the app falls back to the
	// deterministic analyzers instead of timing out against the API.
	if (quotaExhausted) {
		throw new Error("Daily AI quota reached for today; using local analysis");
	}

	const payload = {
		model: options.model || process.env.GROQ_MODEL || DEFAULT_MODEL,
		temperature: options.temperature ?? 0.7,
		// Frugal defaults: most extraction tasks need far less than 1.2K tokens,
		// and smaller responses stretch the daily quota much further.
		max_tokens: options.maxTokens ?? 700,
		// Pass a full conversation when provided, otherwise build system + user.
		messages: options.messages || [
			{ role: "system", content: systemPrompt },
			{ role: "user", content: userPrompt }
		],
		// Streaming (chat): the caller pipes `response.body`; the timeout only
		// covers reaching the first byte, after which the stream flows freely.
		...(options.stream ? { stream: true } : {})
	};

	// Fresh timeout per attempt so a retry gets the full budget again.
	const makeRequest = async () => {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? REQUEST_TIMEOUT_MS);
		try {
			return await fetch(BASE_URL, {
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
	};

	let response = await makeRequest();
	// One retry for transient upstream failures (5xx, or 429 that is NOT the
	// daily-token quota – e.g. transient RPM limits). Retrying a TPD 429 is
	// pointless: the account is out of tokens until the quota resets.
	if (!response.ok && (response.status >= 500 || response.status === 429)) {
		const errBody = (await response.clone().text()).slice(0, 200);
		if (isDailyQuotaError(response.status, errBody)) {
			quotaExhausted = true;
			throw new Error(`LLM request failed: ${response.status} ${errBody}`);
		}
		await new Promise(resolve => setTimeout(resolve, 1200));
		response = await makeRequest();
	}

	if (!response.ok) {
		// Truncate the upstream error body so failures stay readable.
		const err = (await response.text()).slice(0, 200);
		if (isDailyQuotaError(response.status, err)) quotaExhausted = true;
		throw new Error(`LLM request failed: ${response.status} ${err}`);
	}

	// Streaming: hand the raw response back so the route can pipe `response.body`
	// as a token stream. No JSON parsing – the caller transforms the SSE itself.
	if (options.stream) return response;

	const data = await response.json();
	// Groq follows the OpenAI schema – the assistant message is in `choices[0].message.content`.
	const content = data?.choices?.[0]?.message?.content;
	// Chat-style replies are prose, not JSON – return them untouched.
	if (options.raw) return content;
	return extractJson(content);
}

/**
 * Convert a Groq/OpenAI SSE stream into a stream of plain-text chunks.
 * Parses `data:` lines, extracts `choices[0].delta.content`, and ignores
 * everything else ([DONE], usage payloads, keep-alives). JSON lines split
 * across network chunks are buffered until complete.
 * @param {ReadableStream<Uint8Array>} body – Upstream response body.
 * @returns {ReadableStream<Uint8Array>} Stream of UTF-8 text chunks.
 */
export function groqStreamToText(body) {
	const decoder = new TextDecoder();
	const encoder = new TextEncoder();
	let buffer = "";

	const emitLine = (line, controller) => {
		const trimmed = line.trim();
		if (!trimmed.startsWith("data:")) return;
		const data = trimmed.slice(5).trim();
		if (!data || data === "[DONE]") return;
		try {
			const parsed = JSON.parse(data);
			const delta = parsed?.choices?.[0]?.delta?.content;
			if (delta) controller.enqueue(encoder.encode(delta));
		} catch {
			// Malformed line – skip it.
		}
	};

	return body.pipeThrough(
		new TransformStream({
			transform(chunk, controller) {
				buffer += decoder.decode(chunk, { stream: true });
				const lines = buffer.split("\n");
				buffer = lines.pop() ?? ""; // keep the possibly-incomplete last line
				for (const line of lines) emitLine(line, controller);
			},
			flush(controller) {
				if (buffer) emitLine(buffer, controller);
			}
		})
	);
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
 * @param {string[]} [requiredSkills] – The target role's required skill list,
 *   used so the model's detected/missing skills align with the app's scoring.
 * @returns {Promise<object>} – Same shape as `analyzeResumeText` but enriched.
 */
export async function generateResumeAnalysis(resumeText, targetCareer, requiredSkills = []) {
	const skillList = Array.isArray(requiredSkills) && requiredSkills.length > 0
		? requiredSkills.join(", ")
		: "the standard skills for this role";
	const system = `You are a resume analyst for a career-guidance platform. Extract structured details from the resume and return a JSON object with these keys:
- detectedSkills: array of skills actually present in the resume (real skills only – no project titles, sentences, or descriptions)
- missingSkills: array of skills from the required list that are NOT present in the resume
- strengths: array of short strength phrases
- suggestions: array of concise recommendations
- name: the candidate's full name (empty string if unclear)
- projects: array of objects, each with a short \"title\" (project name only) and a \"description\" (what was built and the outcome, if stated)
- education: array of education entries
- certifications: array of certifications
- careerFit: string, one of "Strong fit", "Moderate fit", or "Needs development"
- matchScore: number from 0 to 100`;
	const user = `Target career: ${targetCareer}\nRequired skills: ${skillList}\n\nResume:\n${resumeText}`;
	const raw = await callLLM(system, user, {
		// Extraction is a deterministic task – low temperature keeps output
		// consistent between runs so the same resume yields the same result.
		// 1.2K tokens is plenty for resume extraction and stretches the quota.
		temperature: 0.2,
		maxTokens: 1200
	});
	const result = toCamelKeys(raw);

	// Normalize alternate key names the model may produce (snake_case, or
	// detectedStrengths/recommendations instead of strengths/suggestions).
	// Every list is coerced to an array so a partial model response can never
	// break the pipeline downstream.
	if (result && typeof result === "object") {
		result.strengths = Array.isArray(result.strengths || result.detectedStrengths)
			? result.strengths || result.detectedStrengths
			: [];
		result.suggestions = Array.isArray(result.suggestions || result.recommendations)
			? result.suggestions || result.recommendations
			: [];
		result.detectedSkills = Array.isArray(result.detectedSkills)
			? result.detectedSkills.filter(isPlausibleSkill)
			: [];
		// Models sometimes return education/certifications entries as objects
		// (e.g. { institution, degree, gpa }). Coerce them to display strings so
		// the UI never has to render raw objects.
		result.education = Array.isArray(result.education)
			? result.education.map(entryToEducationString).filter(Boolean)
			: [];
		result.certifications = Array.isArray(result.certifications)
			? result.certifications.map(entryToCertificationString).filter(Boolean)
			: [];
		result.name = typeof result.name === "string" ? result.name : "";
		result.projects = Array.isArray(result.projects)
			? result.projects.map(project => ({
					title: String(project?.title || project?.name || (typeof project === "string" ? project : "")).trim(),
					description: String(project?.description || "").trim()
				})).filter(project => project.title)
			: [];
		if (!result.targetCareer) result.targetCareer = targetCareer;

		// Models often return a 0–1 fraction instead of a 0–100 percentage.
		if (typeof result.matchScore === "number") {
			result.matchScore = result.matchScore <= 1
				? Math.round(result.matchScore * 100)
				: Math.round(result.matchScore);
		} else {
			result.matchScore = 0;
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

/**
 * Rough sanity check that a model-extracted string looks like a skill name
 * rather than a project title or full sentence.
 * @param {any} value
 * @returns {boolean}
 */
function isPlausibleSkill(value) {
	const v = String(value || "").trim();
	if (!v || v.length > 30) return false;
	const words = v.split(/\s+/).filter(Boolean);
	return words.length <= 4;
}

/**
 * Convert a model education entry (string or object like
 * { institution, degree, gpa, duration }) into a display string.
 * @param {any} entry
 * @returns {string}
 */
function entryToEducationString(entry) {
	if (typeof entry === "string") return entry.trim();
	if (entry && typeof entry === "object") {
		const parts = [entry.degree, entry.institution, entry.duration];
		if (entry.gpa) parts.push(`GPA: ${entry.gpa}`);
		return parts.filter(Boolean).join(", ").trim();
	}
	return "";
}

/**
 * Convert a model certification entry (string or object like
 * { name, title, issuer }) into a display string.
 * @param {any} entry
 * @returns {string}
 */
function entryToCertificationString(entry) {
	if (typeof entry === "string") return entry.trim();
	if (entry && typeof entry === "object") {
		const name = entry.name || entry.title;
		const issuer = entry.issuer || entry.organization;
		return [name, issuer].filter(Boolean).join(" — ").trim();
	}
	return "";
}

// Exported for testing – used internally by callLLM/generateResumeAnalysis.
export { extractJson, toCamelKeys };
