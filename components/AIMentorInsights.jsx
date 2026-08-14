"use client";

import { useState, useEffect } from "react";
import { buildStaticMentorInsights } from "../lib/mentorInsightsStatic";
import { fetchJson } from "../lib/apiClient";
import SectionCard from "./ui/SectionCard";
import Badge from "./ui/Badge";

export default function AIMentorInsights({ analysis }) {
	const [mentor, setMentor] = useState(null);

	useEffect(() => {
		if (!analysis) return;
		let cancelled = false;

		async function loadInsights() {
			// AI mentor insights are generated server-side so GROQ_API_KEY never
			// reaches the browser. Any failure falls back to deterministic static
			// text without surfacing an error – the fallback always renders.
			let payload = null;
			try {
				payload = await fetchJson("/api/mentor-insights", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ analysis }),
					timeoutMs: 30000
				});
			} catch (err) {
				console.warn("Mentor insights unavailable, showing static guidance:", err.message);
			}
			if (!cancelled) {
				setMentor(
					payload?.success && Array.isArray(payload.paragraphs)
						? payload
						: buildStaticMentorInsights(analysis)
				);
			}
		}

		loadInsights();
		return () => {
			cancelled = true;
		};
	}, [analysis]);

	if (!analysis) return null;

	const paragraphs = mentor?.paragraphs ?? [];
	const highlight = mentor?.highlight ?? {};
	// Loading until the first response (AI or static) arrives.
	const loadingInsights = mentor === null;

	return (
		<SectionCard
			eyebrow="AI Mentor Insights"
			title="Your personal career mentor"
			description="Natural language guidance generated from your profile, skills, and career matches."
		>
			<div className="mt-6 rounded-[28px] border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 via-blue-500/5 to-transparent p-6">
				<div className="flex items-start gap-4">
					<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-lg font-bold text-slate-950">
						AI
					</div>
					<div className="space-y-4">
						{paragraphs.length > 0 ? (
							paragraphs.map((paragraph, index) => (
								<p key={index} className="text-sm leading-7 text-slate-200 animate-fade-in">
									{paragraph}
								</p>
							))
						) : (
							<p className="text-sm text-slate-400">
								{loadingInsights ? "Loading mentor insights…" : "Mentor insights are unavailable right now."}
							</p>
						)}
					</div>
				</div>
				<div className="mt-6 flex flex-wrap gap-2">
					{highlight.topCareer && <Badge tone="cyan">Top match: {highlight.topCareer}</Badge>}
					{highlight.readinessScore !== undefined && <Badge tone="emerald">Readiness: {highlight.readinessScore}%</Badge>}
					{highlight.estimatedWeeks && <Badge tone="amber">Focus: {highlight.estimatedWeeks} weeks</Badge>}
				</div>
			</div>
		</SectionCard>
	);
}
