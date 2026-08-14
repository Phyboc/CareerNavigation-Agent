import { NextResponse } from "next/server";

import { buildAnalysis } from "../../../lib/analyzer";
import { clientIp, rateLimit, tooManyRequests } from "../../../lib/rateLimit";

const MAX_BODY_BYTES = 1024 * 1024; // 1 MB – profile payloads are tiny

// Fast path: deterministic analysis only, no LLM round-trip. When the form
// includes resume text, the client fires /api/analyze/enrich in the background
// to merge AI-detected skills, so results render immediately.
export async function POST(request) {
	// Rate limit: 30 deterministic analyses per minute per client.
	const { limited, retryAfter } = rateLimit(`analyze:${clientIp(request)}`, 30);
	if (limited) return tooManyRequests(retryAfter);

	// Reject oversized bodies before parsing.
	const contentLength = Number(request.headers.get("content-length") || 0);
	if (contentLength > MAX_BODY_BYTES) {
		return NextResponse.json({ success: false, error: "Payload too large." }, { status: 413 });
	}

	try {
		const body = await request.json();
		const analysis = buildAnalysis(body);

		return NextResponse.json({
			success: true,
			...analysis
		});
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				error: "Unable to analyze the submitted profile.",
				details: error instanceof Error ? error.message : "Unknown error"
			},
			{ status: 400 }
		);
	}
}