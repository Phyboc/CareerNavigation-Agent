"use client";

import { useRef, useState } from "react";

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

// Run resume analysis through the server so AI (Groq) is used when available,
// with the deterministic keyword analyzer as a fallback.
async function analyzeResumeViaServer(text, career) {
	const response = await fetch(`/api/upload-resume?career=${encodeURIComponent(career)}`, {
		method: "POST",
		headers: { "Content-Type": "text/plain" },
		body: text
	});
	const payload = await response.json();
	if (!response.ok || !payload.success) {
		throw new Error(payload.error || "Resume analysis failed");
	}
	return payload.data;
}

export default function ResumeAnalyzer({ targetCareer = "AI Engineer" }) {
	const [resumeText, setResumeText] = useState("");
	const [analysis, setAnalysis] = useState(null);
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState("");
	const fileInputRef = useRef(null);

	const runAnalysis = async (text) => {
		setIsAnalyzing(true);
		setError("");
		try {
			const data = await analyzeResumeViaServer(text, targetCareer);
			setAnalysis(data);
		} catch (err) {
			// Offline/edge fallback: run the deterministic analyzer client-side.
			console.error("Server resume analysis failed, using local fallback:", err);
			setAnalysis(analyzeResumeText(text, targetCareer));
			setError("Live analysis is unavailable — showing local keyword results.");
		} finally {
			setIsAnalyzing(false);
		}
	};

	const handleAnalyze = () => {
		runAnalysis(resumeText.trim() || initialText);
	};

	const loadSample = () => {
		setResumeText(initialText);
		runAnalysis(initialText);
	};

	const handleFileUpload = async (event) => {
		const file = event.target.files?.[0];
		if (!file) return;
		setUploading(true);
		setError("");
		try {
			const arrayBuffer = await file.arrayBuffer();
			const response = await fetch(`/api/upload-resume?career=${encodeURIComponent(targetCareer)}`, {
				method: "POST",
				headers: { "Content-Type": file.type || "application/pdf" },
				body: arrayBuffer
			});
			const payload = await response.json();
			if (!response.ok || !payload.success) {
				throw new Error(payload.error || "Resume upload failed");
			}
			const data = payload.data || {};
			// The server already analyzed the extracted text, so fill both the
			// editor and the results in one step.
			setResumeText(data.fullText || resumeText);
			setAnalysis(data);
		} catch (err) {
			console.error("Resume upload error", err);
			setError(err instanceof Error ? err.message : "Could not read the uploaded file.");
		} finally {
			setUploading(false);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	};

	const strengths = analysis?.strengths || [];
	const missingSkills = analysis?.missingSkills || [];
	const detectedSkills = analysis?.detectedSkills || [];
	const suggestions = analysis?.suggestions || [];
	const extractedSections = analysis?.projects?.length || analysis?.education?.length || analysis?.certifications?.length;

	return (
		<SectionCard
			eyebrow="Resume analysis"
			title="Analyze your resume"
			description="Detect strengths, missing skills, recommendations, and career fit for your target role."
		>
			<div className="mt-6 flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
				<p className="text-sm text-slate-400">Target career: <span className="font-semibold text-cyan-200">{targetCareer}</span></p>
				<div className="flex flex-wrap items-center gap-3">
					<button type="button" onClick={loadSample} disabled={isAnalyzing} className="inline-flex h-11 items-center justify-center rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20 disabled:opacity-60">
						Load sample resume
					</button>
					<input
						ref={fileInputRef}
						id="resume-file-input"
						type="file"
						accept="application/pdf,text/plain"
						onChange={handleFileUpload}
						className="hidden"
					/>
					<label
						htmlFor="resume-file-input"
						className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20 disabled:opacity-60"
					>
						{uploading ? "Processing file…" : "Upload PDF or TXT"}
					</label>
				</div>
			</div>

			{error ? (
				<div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
					{error}
				</div>
			) : null}

			<div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
				<div className="space-y-3">
					<textarea
						value={resumeText}
						onChange={(event) => setResumeText(event.target.value)}
						rows={12}
						placeholder="Paste resume text here or upload a PDF…"
						className="w-full rounded-[28px] border border-white/10 bg-slate-950/80 px-4 py-4 text-sm leading-7 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50"
					/>
					<button
						type="button"
						onClick={handleAnalyze}
						disabled={isAnalyzing}
						className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:opacity-70"
					>
						{isAnalyzing ? "Analyzing…" : "Analyze resume"}
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
							<p className="text-xs text-slate-400">skill alignment</p>
							<ProgressBar value={analysis.matchScore} className="mt-3" animated={isAnalyzing} />
						</div>
					) : (
						<div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm text-slate-400">
							{isAnalyzing ? "Analyzing your resume…" : "Results will appear here after analysis."}
						</div>
					)}
				</div>
			</div>

			{analysis ? (
				<div className="mt-6 grid gap-4 md:grid-cols-2">
					<div className="rounded-3xl border border-emerald-400/15 bg-emerald-400/5 p-4">
						<p className="text-sm font-semibold text-emerald-200">Strengths</p>
						<div className="mt-3 flex flex-wrap gap-2">
							{strengths.length > 0 ? strengths.map(item => (
								<Badge key={item} tone="emerald">{item}</Badge>
							)) : (
								<p className="text-sm text-slate-400">No strengths detected.</p>
							)}
						</div>
					</div>

					<div className="rounded-3xl border border-rose-400/15 bg-rose-400/5 p-4">
						<p className="text-sm font-semibold text-rose-200">Missing Skills</p>
						<div className="mt-3 flex flex-wrap gap-2">
							{missingSkills.length > 0 ? missingSkills.map(item => (
								<Badge key={item} tone="rose">{item}</Badge>
							)) : (
								<p className="text-sm text-slate-400">No major skill gaps detected.</p>
							)}
						</div>
					</div>

					<div className="rounded-3xl border border-sky-400/15 bg-sky-400/5 p-4">
						<p className="text-sm font-semibold text-sky-200">Detected Skills</p>
						<div className="mt-3 flex flex-wrap gap-2">
							{detectedSkills.length > 0 ? detectedSkills.map(item => (
								<Badge key={item} tone="sky">{item}</Badge>
							)) : (
								<p className="text-sm text-slate-400">No skills detected.</p>
							)}
						</div>
					</div>

					<div className="rounded-3xl border border-amber-400/15 bg-amber-400/5 p-4">
						<p className="text-sm font-semibold text-amber-200">Recommendations</p>
						<ul className="mt-3 space-y-2 text-sm leading-6 text-slate-200">
							{suggestions.length > 0 ? suggestions.map(item => (
								<li key={item}>• {item}</li>
							)) : (
								<li className="text-slate-400">No recommendations yet.</li>
							)}
						</ul>
					</div>
				</div>
			) : null}

			{analysis && extractedSections ? (
				<div className="mt-6 grid gap-4 md:grid-cols-3">
					{analysis.projects?.length ? (
						<div className="rounded-3xl border border-white/10 bg-white/5 p-4">
							<p className="text-sm font-semibold text-slate-200">Projects</p>
							<div className="mt-3 flex flex-wrap gap-2">
								{analysis.projects.map(item => (
									<Badge key={item} tone="slate">{item}</Badge>
								))}
							</div>
						</div>
					) : null}
					{analysis.education?.length ? (
						<div className="rounded-3xl border border-white/10 bg-white/5 p-4">
							<p className="text-sm font-semibold text-slate-200">Education</p>
							<ul className="mt-3 space-y-1.5 text-sm leading-6 text-slate-300">
								{analysis.education.map(item => (
									<li key={item}>{item}</li>
								))}
							</ul>
						</div>
					) : null}
					{analysis.certifications?.length ? (
						<div className="rounded-3xl border border-white/10 bg-white/5 p-4">
							<p className="text-sm font-semibold text-slate-200">Certifications</p>
							<ul className="mt-3 space-y-1.5 text-sm leading-6 text-slate-300">
								{analysis.certifications.map(item => (
									<li key={item}>{item}</li>
								))}
							</ul>
						</div>
					) : null}
				</div>
			) : null}
		</SectionCard>
	);
}
