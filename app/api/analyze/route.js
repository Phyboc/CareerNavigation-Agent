import { NextResponse } from "next/server";

import { analyzeCareerProfile } from "../../../lib/analyzer";

export async function POST(request) {
	try {
		const body = await request.json();
		const analysis = analyzeCareerProfile(body);

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