import { NextResponse } from "next/server";

import { analyzeCareerProfile } from "../../../../lib/analyzer";
import { clientIp, rateLimit, tooManyRequests } from "../../../../lib/rateLimit";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 1024 * 1024; // 1 MB

// Background enrichment endpoint. Runs the full pipeline (including the LLM
// resume-analysis step) and returns the enriched analysis. Called by the client
// after the fast /api/analyze result is shown, so the LLM never blocks the UI.
export async function POST(request) {
	// Rate limit: 20 AI enrichments per minute per client (an LLM call each).
	const { limited, retryAfter } = rateLimit(`enrich:${clientIp(request)}`, 20);
	if (limited) return tooManyRequests(retryAfter);

	const contentLength = Number(request.headers.get("content-length") || 0);
	if (contentLength > MAX_BODY_BYTES) {
		return NextResponse.json({ success: false, error: "Payload too large." }, { status: 413 });
	}

	try {
		const body = await request.json();
		const analysis = await analyzeCareerProfile(body);

		return NextResponse.json({
			success: true,
			...analysis
		});
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				error: "Unable to enrich the profile with resume data.",
				details: error instanceof Error ? error.message : "Unknown error"
			},
			{ status: 500 }
		);
	}
}
