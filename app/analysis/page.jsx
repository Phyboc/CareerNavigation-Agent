"use client";

import AIMentorInsights from "../../components/AIMentorInsights";
import CareerJourney from "../../components/CareerJourney";
import CareerMatches from "../../components/CareerMatches";
import ExportReportButton from "../../components/ExportReportButton";
import ReadinessScore from "../../components/ReadinessScore";
import SkillGap from "../../components/SkillGap";
import LoadingState from "../../components/ui/LoadingState";
import { useAnalysis } from "../../context/AnalysisContext";

export default function AnalysisPage() {
	const { analysis, loading, error } = useAnalysis();

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
					<p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">Analysis</p>
					<h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Your Career Analysis</h1>
					<p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
						Readiness score, career matches, skill gaps, and AI mentor insights for {analysis.profile?.name || "your profile"}.
					</p>
				</div>
				<ExportReportButton />
			</div>

			{loading ? <LoadingState /> : null}

			{error ? (
				<div className="rounded-[28px] border border-amber-400/20 bg-amber-400/10 px-5 py-4 text-sm text-amber-100">
					{error}
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
