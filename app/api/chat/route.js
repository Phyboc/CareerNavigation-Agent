import { NextResponse } from "next/server";

import { callLLM, groqStreamToText } from "../../../lib/aiProvider";
import { handleIntakeTurn } from "../../../lib/intake";
import { clientIp, rateLimit, tooManyRequests } from "../../../lib/rateLimit";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 512 * 1024; // 512 KB – chat history + analysis summary

const INTENTS = ["career", "resume", "study"];

// Compact, grounded summary of the user's analysis used to personalize replies.
function summarizeAnalysis(analysis = {}) {
	const profile = analysis.profile || {};
	const readiness = analysis.readiness || {};
	const skillGap = analysis.skillGap || {};
	const matches = (analysis.careerMatches || [])
		.slice(0, 3)
		.map(match => `${match.career} (${match.score}% match)`);
	const resume = analysis.resumeAnalysis || {};

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
		topCareerMatches: matches,
		roadmap: (analysis.roadmap || []).map(phase => ({
			phase: phase.phase,
			title: phase.title,
			items: phase.items,
			outcome: phase.outcome
		})),
		weeklySchedule: (analysis.weeklySchedule || []).map(day => ({
			day: day.day,
			focus: day.focus,
			hours: day.hours
		})),
		resumeAnalysis: {
			matchScore: resume.matchScore,
			careerFit: resume.careerFit,
			detectedSkills: resume.detectedSkills || [],
			missingSkills: resume.missingSkills || [],
			suggestions: resume.suggestions || [],
			projects: Array.isArray(resume.projects)
				? resume.projects.map(project => ({ title: project?.title, description: project?.description }))
				: []
		},
		nextStep: analysis.nextStep
			? { title: analysis.nextStep.title, description: analysis.nextStep.description, href: analysis.nextStep.href }
			: null
	};
}

function buildAgentPrompt(agent, analysis) {
	const grounded = analysis && typeof analysis === "object" && analysis.profile
		? `Here is the user's career profile and analysis to ground your answers:\n${JSON.stringify(summarizeAnalysis(analysis))}`
		: "The user has not completed an assessment yet, so give general guidance and encourage them to complete the assessment for personalized advice.";

	const common = `\n\n${grounded}\n\nGuidelines:\n- Answer in plain, helpful prose. Be concise: 2-5 sentences unless the question genuinely needs more.\n- Reference the user's own data when relevant. Never invent facts about the user that are not in the data above.\n- Do not return JSON or markdown tables – just natural conversational text.`;

	const prompts = {
		career: `You are CareerCompass AI, a friendly and practical AI career mentor for students.\n\nYour job is to guide the student's career journey: explain their readiness score, skill gaps, career matches, and what to work on next. Recommend the single best next step (see nextStep in the data) and, when useful, point them to an app page with a markdown link like [Roadmap](/roadmap), [Projects](/projects), [Resume analyzer](/resume), or [Assessment](/assessment).${common}`,
		resume: `You are CareerCompass AI's resume reviewer.\n\nYour job is to critique the user's resume against their target role: evaluate bullet quality and impact metrics, spot weak or missing keywords, and give concrete rewrite suggestions. Use the resumeAnalysis (match score, detected/missing skills, suggestions, projects) when present; if there is no resume analysis yet, tell them to run the resume analyzer first.${common}`,
		study: `You are CareerCompass AI's study planner.\n\nYour job is to turn the user's roadmap and weekly schedule into concrete, day-by-day study plans: what to learn, practice, and build each day, paced to their available hours. Use the roadmap phases and weekly schedule when present; if there is no roadmap yet, suggest completing the assessment first.${common}`
	};

	return prompts[agent] || prompts.career;
}

// Cheap intent classifier: one of career/resume/study based on the last user
// message. Never blocks the chat – any failure falls back to the career mentor.
async function classifyIntent(lastUserMessage) {
	if (!lastUserMessage) return "career";
	try {
		const label = await callLLM(
			"You are an intent classifier. Reply with exactly one word: career, resume, or study.",
			`User message: ${lastUserMessage}\n\nWhich intent is this?\n- career: career guidance, skill gaps, readiness, career matches, what to learn next\n- resume: resume review, bullet quality, keywords, interview prep\n- study: study plans, weekly schedule, day-by-day planning`,
			{ raw: true, maxTokens: 5, temperature: 0 }
		);
		const text = String(label || "").toLowerCase();
		return INTENTS.find(intent => new RegExp(`\\b${intent}\\b`).test(text)) || "career";
	} catch {
		return "career";
	}
}

// Conversational endpoint. Classifies the intent, streams the specialist
// agent's reply as plain-text chunks, and tags it with X-Agent for the UI.
export async function POST(request) {
	// Rate limit: 20 chat messages per minute per client (an LLM call each).
	const { limited, retryAfter } = rateLimit(`chat:${clientIp(request)}`, 20);
	if (limited) return tooManyRequests(retryAfter);

	const contentLength = Number(request.headers.get("content-length") || 0);
	if (contentLength > MAX_BODY_BYTES) {
		return NextResponse.json({ success: false, error: "Payload too large." }, { status: 413 });
	}		try {
			const body = await request.json();
			const messages = Array.isArray(body?.messages) ? body.messages.slice(-10) : [];
			const analysis = body?.analysis && typeof body.analysis === "object" ? body.analysis : null;

			// Conversational intake: a dedicated, non-streaming flow that builds
			// the profile field by field (used by the assessment page builder).
			if (body?.mode === "intake") {
				const result = await handleIntakeTurn(messages, body?.profile);
				return NextResponse.json({ success: true, ...result });
			}

			const lastUser = [...messages].reverse().find(message => message.role === "user")?.content || "";
			const agent = await classifyIntent(lastUser);

		// Streaming path: the model's tokens are forwarded as plain-text
		// chunks (Groq SSE parsed server-side), so the mentor's reply
		// appears as it is generated instead of after a long spinner.
		const upstream = await callLLM("", "", {
			messages: [
				{ role: "system", content: buildAgentPrompt(agent, analysis) },
				...messages
			],
			maxTokens: 600,
			temperature: 0.7,
			raw: true,
			stream: true
		});

		const stream = groqStreamToText(upstream.body);
		return new Response(stream, {
			headers: {
				"Content-Type": "text/plain; charset=utf-8",
				"Cache-Control": "no-cache, no-transform",
				"X-Accel-Buffering": "no",
				"X-Agent": agent
			}
		});
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
