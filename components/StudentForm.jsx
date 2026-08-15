"use client";

import { useEffect, useRef, useState } from "react";

import { fetchJson } from "../lib/apiClient";
import { buildAnalysis, getRequiredSkills } from "../lib/analyzer";
import { careerPaths } from "../lib/careerPaths";

export default function StudentForm({ onAnalyze, loading = false, prefill = null }) {
	const [form, setForm] = useState(() => ({
		name: prefill?.name || "",
		degree: prefill?.degree || "",
		skills: prefill?.skills || "",
		projects: prefill?.projects || "",
		goal: prefill?.goal || "AI Engineer",
		hours: prefill?.hours || "2",
		resumeText: ""
	}));
	const [uploading, setUploading] = useState(false);
	const [extracted, setExtracted] = useState(null);
	const [uploadError, setUploadError] = useState("");
	const [live, setLive] = useState(null);
	const fileInputRef = useRef(null);

	// Live readiness preview: recompute the deterministic analysis as the form
	// changes so the score updates in real time (no server round-trip).
	useEffect(() => {
		const timer = setTimeout(() => {
			try {
				const payload = {
					name: form.name,
					degree: form.degree,
					skills: form.skills,
					projects: form.projects,
					goal: form.goal,
					hoursPerDay: Number(form.hours) || 1
				};
				const result = buildAnalysis(payload);
				setLive({
					score: result.readiness.score,
					matched: result.skillGap.existingSkills.length,
					missing: result.skillGap.missingSkills.length,
					total: getRequiredSkills(form.goal).length,
					goal: form.goal
				});
			} catch {
				// Ignore partial/invalid form states.
			}
		}, 400);
		return () => clearTimeout(timer);
	}, [form]);

	const handleChange = (field) => (event) => {
		setForm(previous => ({
			...previous,
			[field]: event.target.value
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		onAnalyze({
			name: form.name,
			degree: form.degree,
			skills: form.skills,
			projects: form.projects,
			resumeText: form.resumeText,
			goal: form.goal,
			hoursPerDay: Number(form.hours)
		});
	};

	async function uploadResumeFile(file) {
		if (!file) return;
		setUploading(true);
		setUploadError("");
		try {
			const arrayBuffer = await file.arrayBuffer();
			const payload = await fetchJson(`/api/upload-resume?career=${encodeURIComponent(form.goal)}`, {
				method: "POST",
				headers: {
					"Content-Type": file.type || "application/pdf"
				},
				body: arrayBuffer,
				timeoutMs: 30000
			});
			if (payload.success) {
				const data = payload.data || {};
				const skills = Array.isArray(data.detectedSkills) ? data.detectedSkills.join(", ") : form.skills;
				// Projects are structured { title, description } – only titles go
				// into the form; descriptions are kept for the analysis view.
				const projects = Array.isArray(data.projects)
					? data.projects.map(project => (typeof project === "string" ? project : project.title)).filter(Boolean).join(", ")
					: (data.projectTitles || []).join(", ") || form.projects;
				const firstEducation = data.education && data.education.length ? data.education[0] : "";
				const degree = typeof firstEducation === "string"
					? firstEducation
					: [firstEducation?.degree, firstEducation?.institution].filter(Boolean).join(", ") || form.degree;
				setForm(prev => ({ ...prev, name: data.name || prev.name, skills, projects, degree, resumeText: data.fullText || prev.resumeText }));
				setExtracted(data);
			} else {
				setUploadError(payload.error || "Could not read that file. Try a text or PDF resume.");
			}
		} catch (e) {
			console.error("Resume upload error", e);
			setUploadError(e instanceof Error ? e.message : "Could not read that file. Try a text or PDF resume.");
		} finally {
			setUploading(false);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	}

	return (
		<form onSubmit={handleSubmit} className="rounded-[32px] border border-slate-700/20 bg-white/85 p-6 shadow-[0_30px_80px_rgba(31,36,48,0.12)] backdrop-blur-md sm:p-8">
			<div className="flex flex-col gap-5 border-b border-slate-700/20 pb-6 lg:flex-row lg:items-center lg:justify-between">
				<div>
					<p className="text-sm font-medium tracking-wide text-cyan-700">Assessment form</p>
					<h2 className="mt-1 font-display text-2xl font-bold text-slate-100 tracking-tight">Tell us about yourself</h2>
					<p className="mt-1.5 text-sm leading-relaxed text-slate-400">Upload a resume to pre-fill your profile details below automatically.</p>
				</div>
				<div className="flex items-center gap-3.5">
					<input ref={fileInputRef} id="resume-upload-input" type="file" accept="application/pdf,text/plain" onChange={(e) => uploadResumeFile(e.target.files?.[0])} className="hidden" />
					<label htmlFor="resume-upload-input" className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full border border-cyan-600/30 bg-cyan-600/10 px-5 text-sm font-semibold text-cyan-800 transition-all duration-200 hover:bg-cyan-600/20 active:scale-[0.98]">
						{uploading ? "Processing PDF..." : "Upload resume (PDF)"}
					</label>
					{uploadError ? (
						<div className="rounded-2xl border border-rose-600/25 bg-rose-600/10 px-4 py-2 text-sm text-rose-800">
							{uploadError}
						</div>
					) : extracted ? (
						<div className="rounded-2xl border border-slate-700/20 bg-white px-4 py-2 text-sm text-slate-300">
							<div className="text-xs font-semibold text-cyan-700">Extracted</div>
							<div className="text-xs text-slate-500 mt-0.5">Skills: {Array.isArray(extracted.detectedSkills) ? extracted.detectedSkills.slice(0, 3).join(', ') : '—'}</div>
						</div>
					) : null}
				</div>
			</div>

			<div className="mt-6 grid gap-5 md:grid-cols-2">
				<div className="flex flex-col gap-2 text-sm text-slate-300">
					<label htmlFor="student-name" className="font-semibold tracking-wide text-slate-200">Full Name</label>
					<input id="student-name" value={form.name} onChange={handleChange("name")} placeholder="e.g. Sivasubramani" className="w-full rounded-2xl border border-slate-700/25 bg-white px-4 py-3 outline-none transition placeholder:text-slate-500 font-medium focus:border-cyan-600/50" required />
				</div>

				<div className="flex flex-col gap-2 text-sm text-slate-300">
					<label htmlFor="student-degree" className="font-semibold tracking-wide text-slate-200">Degree & Education</label>
					<input id="student-degree" value={form.degree} onChange={handleChange("degree")} placeholder="e.g. B.Tech CSE" className="w-full rounded-2xl border border-slate-700/25 bg-white px-4 py-3 outline-none transition placeholder:text-slate-500 font-medium focus:border-cyan-600/50" required />
				</div>

				<div className="flex flex-col gap-2 text-sm text-slate-300 md:col-span-2">
					<label htmlFor="student-skills" className="font-semibold tracking-wide text-slate-200">Current Skills (comma separated)</label>
					<textarea id="student-skills" value={form.skills} onChange={handleChange("skills")} rows={3} placeholder="e.g. Python, Java, DSA, Git, SQL" className="w-full rounded-2xl border border-slate-700/25 bg-white px-4 py-3 outline-none transition placeholder:text-slate-500 font-medium focus:border-cyan-600/50" required />
				</div>

				<div className="flex flex-col gap-2 text-sm text-slate-300 md:col-span-2">
					<label htmlFor="student-projects" className="font-semibold tracking-wide text-slate-200">Projects (comma separated)</label>
					<textarea id="student-projects" value={form.projects} onChange={handleChange("projects")} rows={3} placeholder="e.g. ATM System, Drowsiness Detection System" className="w-full rounded-2xl border border-slate-700/25 bg-white px-4 py-3 outline-none transition placeholder:text-slate-500 font-medium focus:border-cyan-600/50" required />
				</div>

				<div className="flex flex-col gap-2 text-sm text-slate-300">
					<label htmlFor="student-goal" className="font-semibold tracking-wide text-slate-200">Career Goal Target</label>
					<select id="student-goal" value={form.goal} onChange={handleChange("goal")} className="w-full rounded-2xl border border-slate-700/25 bg-white px-4 py-3 outline-none transition font-medium focus:border-cyan-600/50">
						{Object.keys(careerPaths).map(career => (
							<option key={career}>{career}</option>
						))}
					</select>
				</div>

				<div className="flex flex-col gap-2 text-sm text-slate-300">
					<label htmlFor="student-hours" className="font-semibold tracking-wide text-slate-200">Study Hours Per Day</label>
					<input id="student-hours" type="number" min="1" max="12" value={form.hours} onChange={handleChange("hours")} className="w-full rounded-2xl border border-slate-700/25 bg-white px-4 py-3 outline-none transition placeholder:text-slate-500 font-medium focus:border-cyan-600/50" required />
				</div>
			</div>

			{live ? (
				<div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border border-cyan-600/20 bg-cyan-600/5 px-4 py-3 text-sm text-slate-400">
					<span className="font-semibold text-cyan-800">Live readiness: {live.score}%</span>
					<span className="text-slate-500">· {live.matched} of {live.total} {live.goal} skills matched</span>
					{live.missing > 0 ? (
						<span className="text-amber-700">· {live.missing} skills to close</span>
					) : (
						<span className="text-emerald-700">· No major gaps</span>
					)}
				</div>
			) : null}

			<div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
				<button type="submit" disabled={loading} className="inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 via-cyan-600 to-cyan-700 px-8 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(15,118,110,0.25)] transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 dark:from-cyan-600 dark:via-cyan-700 dark:to-cyan-900">
					{loading ? "Analyzing Profile Details..." : "Run Career Assessment"}
				</button>
				<p className="text-xs text-slate-500">Your information will be securely cached in your local session store.</p>
			</div>
		</form>
	);
}