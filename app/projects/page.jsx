"use client";

import ProjectRecommendations from "../../components/ProjectRecommendations";
import ExportReportButton from "../../components/ExportReportButton";
import EmptyState from "../../components/ui/EmptyState";
import { useAnalysis } from "../../context/AnalysisContext";

export default function ProjectsPage() {
	const { analysis } = useAnalysis();

	if (!analysis) {
		return (
			<div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
				<EmptyState title="No project recommendations yet" description="Complete your career assessment to get personalized project ideas." />
			</div>
		);
	}

	return (
		<div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">Projects</p>
					<h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Recommended Projects</h1>
					<p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
						Build portfolio projects at every difficulty level to grow toward your career goal.
					</p>
				</div>
				<ExportReportButton />
			</div>

			<ProjectRecommendations
				careerGoal={analysis.profile?.goal ?? "AI Engineer"}
				projects={analysis.projectRecommendations}
			/>
		</div>
	);
}
