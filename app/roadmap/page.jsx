"use client";

import Roadmap from "../../components/Roadmap";
import StudyPlan from "../../components/StudyPlan";
import ResourceCards from "../../components/ResourceCards";
import ExportReportButton from "../../components/ExportReportButton";
import EmptyState from "../../components/ui/EmptyState";
import { useAnalysis } from "../../context/AnalysisContext";

export default function RoadmapPage() {
	const { analysis } = useAnalysis();

	if (!analysis) {
		return (
			<div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
				<EmptyState title="No roadmap yet" description="Complete your career assessment to generate a personalized learning roadmap and study plan." />
			</div>
		);
	}

	return (
		<div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">Roadmap</p>
					<h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Your Learning Roadmap</h1>
					<p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
						A structured plan and weekly schedule to reach your goal as a {analysis.profile?.goal}.
					</p>
				</div>
				<ExportReportButton />
			</div>

			<Roadmap roadmap={analysis.roadmap ?? []} />
			<StudyPlan weeklySchedule={analysis.weeklySchedule ?? []} />
			<ResourceCards resources={analysis.resources} />
		</div>
	);
}
