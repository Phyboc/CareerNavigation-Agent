"use client";

import { useState } from "react";

export default function StudentForm({ onAnalyze, loading = false }) {
	const [form, setForm] = useState({
		name: "",
		degree: "",
		skills: "",
		projects: "",
		goal: "AI Engineer",
		hours: "2",
		resumeText: ""
	});
	const [uploading, setUploading] = useState(false);
	const [extracted, setExtracted] = useState(null);

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
		try {
			const arrayBuffer = await file.arrayBuffer();
			const res = await fetch(`/api/upload-resume?career=${encodeURIComponent(form.goal)}`, {
				method: "POST",
				headers: {
					"Content-Type": file.type || "application/pdf"
				},
				body: arrayBuffer
			});
			const payload = await res.json();
			if (res.ok && payload.success) {
				const data = payload.data || {};
				const skills = Array.isArray(data.detectedSkills) ? data.detectedSkills.join(", ") : form.skills;
				const projects = Array.isArray(data.projects) ? data.projects.join(", ") : form.projects;
				const degree = data.education && data.education.length ? data.education[0] : form.degree;
				setForm(prev => ({ ...prev, skills, projects, degree, resumeText: data.fullText || prev.resumeText }));
				setExtracted(data);
			} else {
				console.warn("Upload resume failed", payload.error || payload);
			}
		} catch (e) {
			console.error("Resume upload error", e);
		} finally {
			setUploading(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} className="rounded-[32px] border border-white/5 bg-slate-950/40 p-6 shadow-[0_30px_80px_rgba(3,7,18,0.4)] backdrop-blur-md sm:p-8">
			<div className="flex flex-col gap-5 border-b border-white/5 pb-6 lg:flex-row lg:items-center lg:justify-between">
				<div>
					<p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-400 font-display">Assessment Form</p>
					<h2 className="mt-1 font-display text-2xl font-bold text-white tracking-tight">Tell us about yourself</h2>
					<p className="mt-1.5 text-sm leading-relaxed text-slate-400">Upload a resume to pre-fill your profile details below automatically.</p>
				</div>
				<div className="flex items-center gap-3.5">
					<input id="resume-upload-input" type="file" accept="application/pdf,text/plain" onChange={(e) => uploadResumeFile(e.target.files?.[0])} className="hidden" />
					<label htmlFor="resume-upload-input" className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full border border-cyan-500/20 bg-cyan-500/10 px-5 text-sm font-semibold text-cyan-200 transition-all duration-200 hover:bg-cyan-500/20 active:scale-[0.98]">
						{uploading ? "Processing PDF..." : "Upload resume (PDF)"}
					</label>
					{extracted ? (
						<div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-2 text-sm text-slate-300">
							<div className="font-bold font-display text-xs text-cyan-400 uppercase tracking-wider">Extracted</div>
							<div className="text-xs text-slate-400 mt-0.5">Skills: {Array.isArray(extracted.detectedSkills) ? extracted.detectedSkills.slice(0, 3).join(', ') : '—'}</div>
						</div>
					) : null}
				</div>
			</div>

			<div className="mt-6 grid gap-5 md:grid-cols-2">
				<div className="flex flex-col gap-2 text-sm text-slate-300">
					<span className="font-semibold tracking-wide text-slate-200">Full Name</span>
					<input value={form.name} onChange={handleChange("name")} placeholder="e.g. Sivasubramani" className="w-full rounded-2xl border border-white/5 bg-white/5 px-4 py-3 outline-none transition placeholder:text-slate-600 font-medium focus:border-cyan-500/40 focus:bg-white/10" required />
				</div>

				<div className="flex flex-col gap-2 text-sm text-slate-300">
					<span className="font-semibold tracking-wide text-slate-200">Degree & Education</span>
					<input value={form.degree} onChange={handleChange("degree")} placeholder="e.g. B.Tech CSE" className="w-full rounded-2xl border border-white/5 bg-white/5 px-4 py-3 outline-none transition placeholder:text-slate-600 font-medium focus:border-cyan-500/40 focus:bg-white/10" required />
				</div>

				<div className="flex flex-col gap-2 text-sm text-slate-300 md:col-span-2">
					<span className="font-semibold tracking-wide text-slate-200">Current Skills (comma separated)</span>
					<textarea value={form.skills} onChange={handleChange("skills")} rows={3} placeholder="e.g. Python, Java, DSA, Git, SQL" className="w-full rounded-2xl border border-white/5 bg-white/5 px-4 py-3 outline-none transition placeholder:text-slate-600 font-medium focus:border-cyan-500/40 focus:bg-white/10" required />
				</div>

				<div className="flex flex-col gap-2 text-sm text-slate-300 md:col-span-2">
					<span className="font-semibold tracking-wide text-slate-200">Projects (comma separated)</span>
					<textarea value={form.projects} onChange={handleChange("projects")} rows={3} placeholder="e.g. ATM System, Drowsiness Detection System" className="w-full rounded-2xl border border-white/5 bg-white/5 px-4 py-3 outline-none transition placeholder:text-slate-600 font-medium focus:border-cyan-500/40 focus:bg-white/10" required />
				</div>

				<div className="flex flex-col gap-2 text-sm text-slate-300">
					<span className="font-semibold tracking-wide text-slate-200">Career Goal Target</span>
					<select value={form.goal} onChange={handleChange("goal")} className="w-full rounded-2xl border border-white/5 bg-white/5 px-4 py-3 outline-none transition font-medium focus:border-cyan-500/40 focus:bg-white/10">
						<option>AI Engineer</option>
						<option>Software Engineer</option>
						<option>Data Scientist</option>
						<option>Full Stack Developer</option>
					</select>
				</div>

				<div className="flex flex-col gap-2 text-sm text-slate-300">
					<span className="font-semibold tracking-wide text-slate-200">Study Hours Per Day</span>
					<input type="number" min="1" max="12" value={form.hours} onChange={handleChange("hours")} className="w-full rounded-2xl border border-white/5 bg-white/5 px-4 py-3 outline-none transition placeholder:text-slate-600 font-medium focus:border-cyan-500/40 focus:bg-white/10" required />
				</div>
			</div>

			<div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
				<button type="submit" disabled={loading} className="inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500 px-8 text-sm font-semibold text-slate-950 shadow-[0_4px_20px_rgba(6,182,212,0.25)] transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70">
					{loading ? "Analyzing Profile Details..." : "Run Career Assessment"}
				</button>
				<p className="text-xs text-slate-500">Your information will be securely cached in your local session store.</p>
			</div>
		</form>
	);
}