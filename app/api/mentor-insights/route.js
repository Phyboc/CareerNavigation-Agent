import { NextResponse } from "next/server";

import { buildMentorInsights } from "../../../lib/mentorInsights";

export const runtime = "nodejs";

// Server-only endpoint: GROQ_API_KEY is read inside lib/aiProvider on the server,
// so it never leaks into client bundles. buildMentorInsights falls back to static
// guidance when the model call fails, so this route is resilient by design.
export async function POST(request) {
	try {
		const body = await request.json();
		const analysis = body?.analysis || {};
		const insights = await buildMentorInsights(analysis);

		return NextResponse.json({ success: true, ...insights });
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				error: "Unable to generate mentor insights.",
				details: error instanceof Error ? error.message : "Unknown error"
			},
			{ status: 500 }
		);
	}
}
