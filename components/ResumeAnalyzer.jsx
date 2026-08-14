"use client";

import { useEffect, useRef, useState } from "react";

import { analyzeResumeText } from "../lib/analyzer";
import { fetchJson } from "../lib/apiClient";
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
	const payload = await fetchJson(`/api/upload-resume?career=${encodeURIComponent(career)}`, {
		method: "POST",
		headers: { "Content-Type": "text/plain" },
		body: text,
		timeoutMs: 25000
	});
	if (!payload.success) {
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
	// Guards against stale responses: incremented on every edit/request, so an
	// older server response can never overwrite results for newer text.
	const requestIdRef = useRef(0);

	// Real-time metrics: recompute the deterministic keyword analysis client-side
	// as the text changes (debounced), so the score, fit, and skill chips update
	// instantly without waiting for the server.
	useEffect(() => {
		const text = resumeText.trim();
		if (!text) return;
		const id = ++requestIdRef.current;
		const timer = setTimeout(() => {
			const live = analyzeResumeText(text, targetCareer);
			if (requestIdRef.current === id) {
				setAnalysis(previous => ({
					...live,
					// Keep structured sections from the last server/AI run so they
					// don't vanish while the user edits the text.
					name: previous?.name || "",
					projects: previous?.projects || [],
					education: previous?.education || [],
					certifications: previous?.certifications || []
				}));
			}
		}, 500);
		return () => clearTimeout(timer);
	}, [resumeText, targetCareer]);

	const runAnalysis = async (text) => {
		const id = ++requestIdRef.current;
		setIsAnalyzing(true);
		setError("");
		try {
			const data = await analyzeResumeViaServer(text, targetCareer);
			if (requestIdRef.current === id) setAnalysis(data);
		} catch (err) {
			// Offline/edge fallback: run the deterministic analyzer client-side.
			console.error("Server resume analysis failed, using local fallback:", err);
			if (requestIdRef.current === id) {
				setAnalysis(analyzeResumeText(text, targetCareer));
				setError("AI analysis is unavailable — showing local keyword results.");
			}
		} finally {
			if (requestIdRef.current === id) setIsAnalyzing(false);
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
		const id = ++requestIdRef.current;
		setUploading(true);
		setError("");
		try {
			const arrayBuffer = await file.arrayBuffer();
			const payload = await fetchJson(`/api/upload-resume?career=${encodeURIComponent(targetCareer)}`, {
				method: "POST",
				headers: { "Content-Type": file.type || "application/pdf" },
				body: arrayBuffer,
				timeoutMs: 30000
			});
			if (!payload.success) {
				throw new Error(payload.error || "Resume upload failed");
			}
			const data = payload.data || {};
			// The server already analyzed the extracted text, so fill both the
			// editor and the results in one step.
			if (requestIdRef.current === id) {
				setResumeText(data.fullText || resumeText);
				setAnalysis(data);
			}
		} catch (err) {
			console.error("Resume upload error", err);
			if (requestIdRef.current === id) {
				setError(err instanceof Error ? err.message : "Could not read the uploaded file.");
			}
		} finally {
			if (requestIdRef.current === id) setUploading(false);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	};

	const strengths = analysis?.strengths || [];
	const missingSkills = analysis?.missingSkills || [];
	const detectedSkills = analysis?.detectedSkills || [];
	const suggestions = analysis?.suggestions || [];
	// Projects arrive as { title, description } objects (or legacy strings).
	const projectsList = (analysis?.projects || []).map(project =>
		typeof project === "string" ? { title: project, description: "" } : project
	);
	const extractedSections = projectsList.length || analysis?.education?.length || analysis?.certifications?.length;

	// Defensive: a section entry may arrive as a string or an object (the model
	// sometimes returns structured education/certification objects). Coerce to a
	// display string so the UI never renders a raw object.
	const toDisplayString = (value) => {
		if (typeof value === "string") return value;
		if (value && typeof value === "object") {
			const parts = [value.degree, value.institution, value.gpa && `GPA: ${value.gpa}`];
			const joined = parts.filter(Boolean).join(", ");
			if (joined) return joined;
			return String(value.name || value.title || "");
		}
		return String(value || "");
	};

	// A project description is stronger when it carries numbers or impact verbs.
	const hasImpactMetrics = (description) => {
		const text = String(description || "");
		return /\d/.test(text) || /\b(increased|reduced|improved|boosted|cut|grew|rose|saved|lowered|shipped|scaled|faster|by)\b/i.test(text);
	};

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
						className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-cyan-600 px-5 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:opacity-70"
					>
						{isAnalyzing ? "Analyzing…" : "Analyze with AI"}
					</button>
					<p className="text-xs leading-5 text-slate-500">
						Results update live as you type. Click <span className="text-slate-400">Analyze with AI</span> to enrich them with the model (name, projects, certifications).
					</p>
				</div>

				<div className="space-y-4">
					{analysis ? (
						<div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-center">
							<p className="text-xs font-medium tracking-wide text-slate-400">Career fit</p>
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
					{projectsList.length ? (
						<div className="rounded-3xl border border-white/10 bg-white/5 p-4">
							<p className="text-sm font-semibold text-slate-200">Projects</p>
							<div className="mt-3 flex flex-wrap gap-2">
								{projectsList.map(project => (
									<Badge key={project.title} tone="slate">{project.title}</Badge>
								))}
							</div>
						</div>
					) : null}
					{analysis.education?.length ? (
						<div className="rounded-3xl border border-white/10 bg-white/5 p-4">
							<p className="text-sm font-semibold text-slate-200">Education</p>
							<ul className="mt-3 space-y-1.5 text-sm leading-6 text-slate-300">
								{analysis.education.map((item, index) => {
									const text = toDisplayString(item);
									return <li key={`${index}-${text}`}>{text}</li>;
								})}
							</ul>
						</div>
					) : null}
					{analysis.certifications?.length ? (
						<div className="rounded-3xl border border-white/10 bg-white/5 p-4">
							<p className="text-sm font-semibold text-slate-200">Certifications</p>
							<ul className="mt-3 space-y-1.5 text-sm leading-6 text-slate-300">
								{analysis.certifications.map((item, index) => {
									const text = toDisplayString(item);
									return <li key={`${index}-${text}`}>{text}</li>;
								})}
							</ul>
						</div>
					) : null}
				</div>
			) : null}

			{analysis && projectsList.length > 0 ? (
				<div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4">
					<p className="text-sm font-semibold text-slate-200">Project insights</p>
					<p className="mt-1 text-xs leading-5 text-slate-400">Descriptions feed your analysis — strong ones state what you built and the measurable outcome.</p>
					<div className="mt-3 space-y-3">
						{projectsList.map(project => (
							<div key={project.title} className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">
								<div className="flex flex-wrap items-center justify-between gap-2">
									<p className="text-sm font-semibold text-white">{project.title}</p>
									{project.description && !hasImpactMetrics(project.description) ? (
										<Badge tone="rose">Add impact metrics</Badge>
									) : null}
								</div>
								{project.description ? (
									<p className="mt-1.5 text-sm leading-6 text-slate-300">{project.description}</p>
								) : (
									<p className="mt-1.5 text-sm text-amber-200/80">Add a one-line description of what you built and the outcome.</p>
								)}
							</div>
						))}
					</div>
				</div>
			) : null}
		</SectionCard>
	);
}
