/**
 * Deterministic chat fallback (no AI, client-safe). When the LLM is
 * unavailable – no API key, daily quota hit, timeout, upstream error – the
 * mentor still answers using only the deterministic analysis. Same principle
 * as the rest of the app: AI is optional, the engine never leaves the user
 * hanging. Replies use the markdown-lite syntax the chat UI renders
 * (**bold**, [label](/path) links).
 */

function greeting(name) {
	return name ? `Hi ${name}! ` : "Hi! ";
}

function gapText(skillGap = {}) {
	const gaps = skillGap.prioritySkills?.length
		? skillGap.prioritySkills
		: skillGap.missingSkills || [];
	return gaps.slice(0, 3);
}

/**
 * @param {string} agent – "career" | "resume" | "study".
 * @param {object} [analysis] – The user's analysis object (may be partial).
 * @param {Array<{role: string, content: string}>} [messages] – Conversation so far.
 * @returns {string} A grounded, plain-text mentor reply.
 */
export function buildChatFallback(agent = "career", analysis, messages = []) {
	// The route passes the (possibly null) analysis object through; null must
	// behave like an empty one, not crash.
	analysis = analysis && typeof analysis === "object" ? analysis : {};
	const profile = analysis.profile || {};
	const readiness = analysis.readiness || {};
	const skillGap = analysis.skillGap || {};
	const matches = analysis.careerMatches || [];
	const topMatch = matches[0];
	const nextStep = analysis.nextStep;
	const resume = analysis.resumeAnalysis || {};
	const name = profile.name;
	const lastUser = [...messages].reverse().find(message => message.role === "user")?.content || "";
	const text = String(lastUser).toLowerCase();
	const hasProfile = Boolean(name && Array.isArray(profile.skills) && profile.skills.length > 0);

	if (!hasProfile) {
		return (
			`${greeting(name)}I don't have your profile yet, so I can only give general advice. ` +
			"Run the assessment — or use the chat profile builder — and I'll give you personalized guidance. " +
			"Here's the link: [Assessment](/assessment)."
		);
	}

	const gaps = gapText(skillGap);
	const gapLine = gaps.length > 0 ? gaps.join(", ") : "no major skill gaps right now";
	const scoreLine =
		readiness.score !== undefined
			? `Your readiness score is **${readiness.score}%** (${readiness.label || "evaluating"}).`
			: "";

	const asksResume = /resume|cv|bullet|keyword|interview/.test(text);
	const asksStudy = /study|plan|schedule|week|day.?by.?day|roadmap|learn/.test(text);

	// Resume reviewer branch.
	if (agent === "resume" || asksResume) {
		const suggestions = Array.isArray(resume.suggestions) ? resume.suggestions : [];
		const details =
			resume.matchScore !== undefined
				? `Your resume currently scores **${resume.matchScore}%** for ${profile.goal} (${resume.careerFit || "evaluating"}).`
				: "I don't have a resume analysis for you yet.";
		const wins =
			suggestions.length > 0
				? `\n\nQuick wins: ${suggestions.slice(0, 2).join(" ")}`
				: "\n\nRun the resume analyzer to see exactly what to improve: [Resume analyzer](/resume).";
		return `${greeting(name)}Let me review your resume.\n\n${details}${wins}`;
	}

	// Study planner branch.
	if (agent === "study" || asksStudy) {
		const phase1 = analysis.roadmap?.[0];
		const firstDay = analysis.weeklySchedule?.[0];
		const focus =
			phase1 && Array.isArray(phase1.items)
				? `\n\n**This week (${phase1.title})**: ${phase1.items.slice(0, 3).join(" · ")}`
				: "";
		const day =
			firstDay
				? `\n\nStart ${firstDay.day} with: ${firstDay.focus}.`
				: "";
		return (
			`${greeting(name)}Here's a practical study plan.\n\n` +
			`${scoreLine} Focus on closing **${gapLine}** first.${focus}${day}\n\n` +
			"See your full plan: [Roadmap](/roadmap)."
		);
	}

	// Career mentor default.
	const strengths =
		Array.isArray(readiness.strengths) && readiness.strengths.length > 0
			? ` Your strengths include ${readiness.strengths.slice(0, 3).join(", ")}.`
			: "";
	const nextLine = nextStep
		? `\n\nYour best next move: **${nextStep.title}** — ${nextStep.description} [Go there](${nextStep.href}).`
		: "";
	const matchLine = topMatch
		? `Your strongest match is **${topMatch.career} (${topMatch.score}% match)**.`
		: `You're aiming for **${profile.goal}**.`;

	return (
		`${greeting(name)}Here's where you stand.\n\n` +
		`${scoreLine} ${matchLine} You have ${gapLine}.${strengths}${nextLine}\n\n` +
		"Ask me about your study plan or resume for more — or add a Groq API key in `.env.local` to unlock full AI answers."
	);
}
