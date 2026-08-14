import { NextResponse } from "next/server";

import { analyzeCareerProfile } from "../../../../lib/analyzer";

export const runtime = "nodejs";

// Background enrichment endpoint. Runs the full pipeline (including the LLM
// resume-analysis step) and returns the enriched analysis. Called by the client
// after the fast /api/analyze result is shown, so the LLM never blocks the UI.
export async function POST(request) {
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
