"use client";

import ResumeAnalyzer from "../../components/ResumeAnalyzer";
import EmptyState from "../../components/ui/EmptyState";
import { useAnalysis } from "../../context/AnalysisContext";

export default function ResumePage() {
	const { analysis } = useAnalysis();

	return (
		<div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
			<div>
				<p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">Resume Analyzer</p>
				<h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Analyze Your Resume</h1>
				<p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
					Paste your resume text to detect strengths, missing skills, and career fit for your target role.
				</p>
			</div>

			{analysis ? (
				<ResumeAnalyzer targetCareer={analysis.profile?.goal ?? "AI Engineer"} />
			) : (
				<EmptyState title="Complete your assessment first" description="Run a career assessment so we can match your resume against your target role." />
			)}
		</div>
	);
}
