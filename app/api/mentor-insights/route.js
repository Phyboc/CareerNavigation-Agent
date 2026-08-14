import { NextResponse } from "next/server";

import { buildMentorInsights } from "../../../lib/mentorInsights";
import { buildStaticMentorInsights } from "../../../lib/mentorInsightsStatic";

export const runtime = "nodejs";

// Server-only endpoint: GROQ_API_KEY is read inside lib/aiProvider on the server,
// so it never leaks into client bundles. This route ALWAYS returns success:true –
// the deterministic static builder is the guaranteed fallback, so the client
// never has to handle an error response for mentor insights.
export async function POST(request) {
	let body = {};
	try {
		body = await request.json();
	} catch {
		// Malformed body – fall through to static insights below.
	}

	const analysis = body?.analysis || {};
	const insights = await buildMentorInsights(analysis)
		.catch(() => buildStaticMentorInsights(analysis));

	return NextResponse.json({ success: true, ...insights });
}
