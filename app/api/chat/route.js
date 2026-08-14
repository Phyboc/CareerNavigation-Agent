import { NextResponse } from "next/server";

import { callLLM } from "../../../lib/aiProvider";
import { clientIp, rateLimit, tooManyRequests } from "../../../lib/rateLimit";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 512 * 1024; // 512 KB – chat history + analysis summary

// Compact, grounded summary of the user's analysis used to personalize replies.
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

function buildSystemPrompt(analysis) {
	const grounded = analysis && typeof analysis === "object" && analysis.profile
		? `Here is the user's career profile and analysis to ground your answers:\n${JSON.stringify(summarizeAnalysis(analysis))}`
		: "The user has not completed an assessment yet, so give general career guidance and encourage them to complete the assessment for personalized advice.";

	return `You are CareerCompass AI, a friendly and practical AI career mentor for students.

${grounded}

Guidelines:
- Answer in plain, helpful prose. Be concise: 2-5 sentences unless the question genuinely needs more.
- Reference the user's own data when relevant (their goal, readiness score, skill gaps, career matches).
- Never invent facts about the user that are not present in the data above.
- Do not return JSON or markdown tables – just natural conversational text.`;
}

// Conversational endpoint. Accepts the message history (plus the analysis used
// for grounding) and returns the mentor's reply as plain text.
export async function POST(request) {
	// Rate limit: 20 chat messages per minute per client (an LLM call each).
	const { limited, retryAfter } = rateLimit(`chat:${clientIp(request)}`, 20);
	if (limited) return tooManyRequests(retryAfter);

	const contentLength = Number(request.headers.get("content-length") || 0);
	if (contentLength > MAX_BODY_BYTES) {
		return NextResponse.json({ success: false, error: "Payload too large." }, { status: 413 });
	}

	try {
		const body = await request.json();
		const messages = Array.isArray(body?.messages) ? body.messages.slice(-10) : [];
		const analysis = body?.analysis && typeof body.analysis === "object" ? body.analysis : null;

		const reply = await callLLM("", "", {
			messages: [
				{ role: "system", content: buildSystemPrompt(analysis) },
				...messages
			],
			maxTokens: 600,
			temperature: 0.7,
			raw: true
		});

		return NextResponse.json({ success: true, reply });
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				error: "The career mentor could not reply right now.",
				details: error instanceof Error ? error.message : "Unknown error"
			},
			{ status: 500 }
		);
	}
}
