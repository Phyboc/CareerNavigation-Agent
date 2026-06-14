"use client";

import { useState } from "react";

import { analyzeResumeText } from "../lib/analyzer";
import Badge from "./ui/Badge";
import ProgressBar from "./ui/ProgressBar";
import SectionCard from "./ui/SectionCard";

const initialText = `Summary
Built a Drowsiness Detection System using Python and machine learning.
Skills: Python, Java, Git, MySQL
Projects: personal AI project, college assignments
`;

const fitTones = {
	"Strong fit": "emerald",
	"Moderate fit": "amber",
	"Needs development": "rose"
};

export default function ResumeAnalyzer({ targetCareer = "AI Engineer" }) {
	const [resumeText, setResumeText] = useState("");
	const [analysis, setAnalysis] = useState(null);
	const [isAnalyzing, setIsAnalyzing] = useState(false);

	const handleAnalyze = () => {
		setIsAnalyzing(true);
		const textToAnalyze = resumeText.trim() || initialText;
		setAnalysis(analyzeResumeText(textToAnalyze, targetCareer));
		setIsAnalyzing(false);
	};

	const loadSample = () => {
		setResumeText(initialText);
		setAnalysis(analyzeResumeText(initialText, targetCareer));
	};

	return (
		<SectionCard
			eyebrow="Resume analysis"
			title="Analyze your resume"
			description="Detect strengths, missing skills, recommendations, and career fit for your target role."
		>
			<div className="mt-6 flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
				<p className="text-sm text-slate-400">Target career: <span className="font-semibold text-cyan-200">{targetCareer}</span></p>
				<button type="button" onClick={loadSample} className="inline-flex h-11 items-center justify-center rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20">
					Load sample resume
				</button>
			</div>

			<div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
				<div className="space-y-3">
					<textarea
						value={resumeText}
						onChange={(event) => setResumeText(event.target.value)}
						rows={12}
						placeholder="Paste resume text here..."
						className="w-full rounded-[28px] border border-white/10 bg-slate-950/80 px-4 py-4 text-sm leading-7 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50"
					/>
					<button
						type="button"
						onClick={handleAnalyze}
						disabled={isAnalyzing}
						className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:opacity-70"
					>
						{isAnalyzing ? "Analyzing..." : "Analyze resume"}
					</button>
				</div>

				<div className="space-y-4">
					{analysis ? (
						<div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-center">
							<p className="text-xs uppercase tracking-wider text-slate-400">Career Fit</p>
							<Badge tone={fitTones[analysis.careerFit] || "slate"} className="mt-2 text-base">
								{analysis.careerFit}
							</Badge>
							<p className="mt-2 text-2xl font-bold text-white">{analysis.matchScore}%</p>
							<p className="text-xs text-slate-400">keyword alignment</p>
							<ProgressBar value={analysis.matchScore} className="mt-3" animated={isAnalyzing} />
						</div>
					) : (
						<div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm text-slate-400">
							Results will appear here after analysis.
						</div>
					)}
				</div>
			</div>

			{analysis ? (
				<div className="mt-6 grid gap-4 md:grid-cols-2">
					<div className="rounded-3xl border border-emerald-400/15 bg-emerald-400/5 p-4">
						<p className="text-sm font-semibold text-emerald-200">Strengths</p>
						<div className="mt-3 flex flex-wrap gap-2">
							{analysis.strengths.map(item => (
								<Badge key={item} tone="emerald">{item}</Badge>
							))}
						</div>
					</div>

					<div className="rounded-3xl border border-rose-400/15 bg-rose-400/5 p-4">
						<p className="text-sm font-semibold text-rose-200">Missing Skills</p>
						<div className="mt-3 flex flex-wrap gap-2">
							{analysis.missingSkills.length > 0 ? analysis.missingSkills.map(item => (
								<Badge key={item} tone="rose">{item}</Badge>
							)) : (
								<p className="text-sm text-slate-400">No major skill gaps detected.</p>
							)}
						</div>
					</div>

					<div className="rounded-3xl border border-sky-400/15 bg-sky-400/5 p-4">
						<p className="text-sm font-semibold text-sky-200">Detected Skills</p>
						<div className="mt-3 flex flex-wrap gap-2">
							{analysis.detectedSkills.map(item => (
								<Badge key={item} tone="sky">{item}</Badge>
							))}
						</div>
					</div>

					<div className="rounded-3xl border border-amber-400/15 bg-amber-400/5 p-4">
						<p className="text-sm font-semibold text-amber-200">Recommendations</p>
						<ul className="mt-3 space-y-2 text-sm leading-6 text-slate-200">
							{(analysis.recommendations || analysis.suggestions).map(item => (
								<li key={item}>• {item}</li>
							))}
						</ul>
					</div>
				</div>
			) : null}
		</SectionCard>
	);
}
