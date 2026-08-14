import { generateMentorInsights } from "./aiProvider";
import { buildStaticMentorInsights } from "./mentorInsightsStatic";

// Compact, grounded summary of the analysis sent to the LLM. The full analysis
// object can be large (roadmaps, resources, reports), which wastes tokens and
// risks oversized-prompt failures; the summary carries everything the mentor
// actually needs.
function summarizeAnalysis(analysis = {}) {
	const profile = analysis.profile || {};
	const readiness = analysis.readiness || {};
	const skillGap = analysis.skillGap || {};
	const matches = (analysis.careerMatches || [])
		.slice(0, 3)
		.map(match => `${match.career} (${match.score}% match)`);

	return {
		name: profile.name,
		degree: profile.degree,
		goal: profile.goal,
		hoursPerDay: profile.hoursPerDay,
		skills: profile.skills || [],
		readinessScore: readiness.score,
		readinessLabel: readiness.label,
		strengths: readiness.strengths || [],
		weaknesses: readiness.weaknesses || [],
		missingSkills: skillGap.missingSkills || [],
		prioritySkills: skillGap.prioritySkills || [],
		topCareerMatches: matches
	};
}

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
		const aiResult = await generateMentorInsights(summarizeAnalysis(analysis));
		if (aiResult && aiResult.paragraphs && aiResult.highlight) {
			return aiResult;
		}
	} catch (e) {
		console.warn("AI mentor insights failed, using static fallback:", e);
	}

	return buildStaticMentorInsights(analysis);
}
