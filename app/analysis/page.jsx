"use client";

import AIMentorInsights from "../../components/AIMentorInsights";
import Link from "next/link";

import CareerJourney from "../../components/CareerJourney";
import CareerMatches from "../../components/CareerMatches";
import ExportReportButton from "../../components/ExportReportButton";
import ReadinessScore from "../../components/ReadinessScore";
import SkillGap from "../../components/SkillGap";
import LoadingState from "../../components/ui/LoadingState";
import { useAnalysis } from "../../context/AnalysisContext";

export default function AnalysisPage() {
	const { analysis, loading, error, history } = useAnalysis();

	if (!analysis) {
		return (
			<div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
				<LoadingState message="Loading analysis..." />
			</div>
		);
	}

	return (
		<div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<p className="text-xs font-medium tracking-wide text-cyan-200">Analysis</p>
					<h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Your Career Analysis</h1>
					<p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
						Readiness score, career matches, skill gaps, and AI mentor insights for {analysis.profile?.name || "your profile"}.
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-3">
					<ExportReportButton />
					<Link
						href="/assessment"
						className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
					>
						Re-run assessment
					</Link>
				</div>
			</div>

			{loading ? <LoadingState /> : null}

			{error ? (
				<div className="rounded-[28px] border border-amber-400/20 bg-amber-400/10 px-5 py-4 text-sm text-amber-100">
					{error}
				</div>
			) : null}

			{history.length > 0 ? (
				<div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<p className="text-xs font-medium tracking-wide text-cyan-200">Progress</p>
						{history.length > 1 ? (
							<p className="text-xs text-slate-400">
								Last assessed: {new Date(history[history.length - 1].savedAt).toLocaleDateString()}
							</p>
						) : null}
					</div>
					<div className="mt-3 flex flex-wrap gap-2">
						{[...history].reverse().slice(0, 10).map((entry, index) => (
							<span
								key={`${entry.savedAt}-${index}`}
								className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100"
								title={`${entry.name} · ${entry.goal}`}
							>
								{entry.readinessScore}% · {new Date(entry.savedAt).toLocaleDateString()}
							</span>
						))}
					</div>
					<p className="mt-3 text-xs text-slate-500">
						Scores are saved locally each time you run an assessment — re-assess after learning to see your progress.
					</p>
				</div>
			) : null}

			<CareerJourney score={analysis.readiness?.score ?? 0} />

			<ReadinessScore
				score={analysis.readiness?.score ?? 0}
				strengths={analysis.readiness?.strengths ?? []}
				weaknesses={analysis.readiness?.weaknesses ?? []}
				loading={loading}
			/>

			<CareerMatches matches={analysis.careerMatches ?? []} selectedCareer={analysis.profile?.goal} />

			<SkillGap
				existingSkills={analysis.skillGap?.existingSkills ?? []}
				missingSkills={analysis.skillGap?.missingSkills ?? []}
				prioritySkills={analysis.skillGap?.prioritySkills ?? []}
			/>

			<AIMentorInsights analysis={analysis} />
		</div>
	);
}
