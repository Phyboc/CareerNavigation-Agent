import { NextResponse } from "next/server";

import { buildAnalysis } from "../../../lib/analyzer";

// Fast path: deterministic analysis only, no LLM round-trip. When the form
// includes resume text, the client fires /api/analyze/enrich in the background
// to merge AI-detected skills, so results render immediately.
export async function POST(request) {
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