"use client";

import AIMentorInsights from "../../components/AIMentorInsights";
import Link from "next/link";

import CareerJourney from "../../components/CareerJourney";
import CareerMatches from "../../components/CareerMatches";
import ExportReportButton from "../../components/ExportReportButton";
import ReadinessScore from "../../components/ReadinessScore";
import SkillGap from "../../components/SkillGap";
import LoadingState from "../../components/ui/LoadingState";
import Reveal from "../../components/ui/Reveal";
import { useAnalysis } from "../../context/AnalysisContext";

export default function AnalysisPage() {
	const { analysis, loading, error, history, clearHistory } = useAnalysis();

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
					<p className="text-xs font-medium tracking-wide text-cyan-700">Analysis</p>
					<h1 className="mt-2 text-3xl font-semibold text-slate-100 sm:text-4xl">Your Career Analysis</h1>
					<p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
						Readiness score, career matches, skill gaps, and AI mentor insights for {analysis.profile?.name || "your profile"}.
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-3">
					<ExportReportButton />
					<Link
						href="/assessment"
						className="inline-flex h-11 items-center justify-center rounded-full border border-slate-700/25 bg-white px-5 text-sm font-semibold text-slate-200 transition hover:bg-slate-900"
					>
						Re-run assessment
					</Link>
				</div>
			</div>

			{analysis.nextStep ? (
				<Reveal>
					<div className="flex flex-col gap-4 rounded-[28px] border border-cyan-600/25 bg-gradient-to-br from-cyan-600/10 via-cyan-600/5 to-transparent p-6 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<p className="text-xs font-medium uppercase tracking-wide text-cyan-700">Your next move</p>
							<h2 className="mt-1 font-display text-xl font-bold tracking-tight text-slate-100">
								{analysis.nextStep.title}
							</h2>
							<p className="mt-1 text-sm leading-6 text-slate-400">{analysis.nextStep.description}</p>
						</div>
						<Link
							href={analysis.nextStep.href}
							className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-cyan-700 px-6 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(15,118,110,0.25)] transition hover:brightness-110 dark:from-cyan-600 dark:to-cyan-900"
						>
							{analysis.nextStep.action} →
						</Link>
					</div>
				</Reveal>
			) : null}

			{loading ? <LoadingState /> : null}

			{error ? (
				<div className="rounded-[28px] border border-amber-600/25 bg-amber-500/10 px-5 py-4 text-sm text-amber-800">
					{error}
				</div>
			) : null}

			{history.length > 0 ? (
				<div className="rounded-[28px] border border-slate-700/25 bg-white/80 p-5">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<p className="text-xs font-medium tracking-wide text-cyan-700">Progress</p>
						<div className="flex items-center gap-3">
							{history.length > 1 ? (
								<p className="text-xs text-slate-400">
									Last assessed: {new Date(history[history.length - 1].savedAt).toLocaleDateString()}
								</p>
							) : null}
							<button
								type="button"
								onClick={() => {
									if (window.confirm("Delete your saved progress history? This cannot be undone.")) {
										clearHistory();
									}
								}}
								className="inline-flex items-center gap-1 rounded-full border border-rose-600/25 bg-rose-600/10 px-3 py-1 text-xs font-medium text-rose-700 transition hover:bg-rose-600/20"
							>
								Clear progress
							</button>
						</div>
					</div>
					<div className="mt-3 flex flex-wrap gap-2">
						{[...history].reverse().slice(0, 10).map((entry, index) => (
							<span
								key={`${entry.savedAt}-${index}`}
								className="rounded-full border border-cyan-600/25 bg-cyan-600/10 px-3 py-1 text-xs font-medium text-cyan-800"
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

			<Reveal>
				<CareerJourney score={analysis.readiness?.score ?? 0} />
			</Reveal>

			<Reveal delay={0.08}>
				<ReadinessScore
					score={analysis.readiness?.score ?? 0}
					strengths={analysis.readiness?.strengths ?? []}
					weaknesses={analysis.readiness?.weaknesses ?? []}
					loading={loading}
				/>
			</Reveal>

			<Reveal delay={0.16}>
				<CareerMatches matches={analysis.careerMatches ?? []} selectedCareer={analysis.profile?.goal} />
			</Reveal>

			<Reveal delay={0.24}>
				<SkillGap
					existingSkills={analysis.skillGap?.existingSkills ?? []}
					missingSkills={analysis.skillGap?.missingSkills ?? []}
					prioritySkills={analysis.skillGap?.prioritySkills ?? []}
				/>
			</Reveal>

			<Reveal delay={0.32}>
				<AIMentorInsights analysis={analysis} />
			</Reveal>
		</div>
	);
}
