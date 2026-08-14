import { generateMentorInsights } from "./aiProvider";
import { buildStaticMentorInsights } from "./mentorInsightsStatic";

/**
 * Server-only builder (reads GROQ_API_KEY via lib/aiProvider). Tries AI
 * generation first and falls back to deterministic text on any failure.
 * Client components should use `buildStaticMentorInsights` directly instead
 * of importing this module, so the AI provider never ships to the browser.
 * @param {object} [analysis] – The full analysis object.
 * @returns {Promise<{ paragraphs: string[], highlight: object }>}
 */
export async function buildMentorInsights(analysis = {}) {
	try {
		const aiResult = await generateMentorInsights(analysis);
		if (aiResult && aiResult.paragraphs && aiResult.highlight) {
			return aiResult;
		}
	} catch (e) {
		console.warn("AI mentor insights failed, using static fallback:", e);
	}

	return buildStaticMentorInsights(analysis);
}
