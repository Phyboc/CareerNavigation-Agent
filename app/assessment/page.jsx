"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import StudentForm from "../../components/StudentForm";
import ProfileBuilder from "../../components/ProfileBuilder";
import LoadingState from "../../components/ui/LoadingState";
import { useAnalysis } from "../../context/AnalysisContext";

export default function AssessmentPage() {
	const { handleAnalyze, loading, error } = useAnalysis();
	const router = useRouter();
	// "form" = quick assessment form, "chat" = mentor-guided profile builder.
	const [mode, setMode] = useState("form");
	const [prefill, setPrefill] = useState(null);
	const [prefillKey, setPrefillKey] = useState(0);

	const onAnalyze = async (formData) => {
		await handleAnalyze(formData);
		router.push("/analysis");
	};

	// The chat builder finished: prefill the form with the collected profile,
	// then run the analysis right away (existing plumbing).
	const onIntakeComplete = async (profile) => {
		const formData = {
			name: profile.name || "",
			degree: profile.degree || "",
			skills: profile.skills || "",
			projects: profile.projects || "",
			resumeText: "",
			goal: profile.goal || "AI Engineer",
			hoursPerDay: Number(profile.hoursPerDay) || 1
		};
		setPrefill({
			...formData,
			hours: String(formData.hoursPerDay)
		});
		setPrefillKey(key => key + 1);
		setMode("form");
		await onAnalyze(formData);
	};

	return (
		<div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
			<div>
				<p className="text-xs font-medium tracking-wide text-cyan-700">Assessment</p>
				<h1 className="mt-2 text-3xl font-semibold text-slate-100 sm:text-4xl">Career Profile Assessment</h1>
				<p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
					Tell us about your background and goals. CareerCompass AI will analyze your profile and generate personalized guidance.
				</p>
			</div>

			<div className="flex w-full max-w-sm items-center gap-1 rounded-full border border-slate-700/25 bg-white p-1">
				<button
					type="button"
					onClick={() => setMode("form")}
					className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
						mode === "form"
							? "bg-gradient-to-r from-cyan-500 to-cyan-700 text-white shadow"
							: "text-slate-300 hover:bg-slate-900"
					}`}
				>
					Quick form
				</button>
				<button
					type="button"
					onClick={() => setMode("chat")}
					className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
						mode === "chat"
							? "bg-gradient-to-r from-cyan-500 to-cyan-700 text-white shadow"
							: "text-slate-300 hover:bg-slate-900"
					}`}
				>
					Chat with mentor
				</button>
			</div>

			{loading ? <LoadingState message="Analyzing your profile and generating insights..." /> : null}

			{error ? (
				<div className="rounded-[28px] border border-amber-600/25 bg-amber-500/10 px-5 py-4 text-sm text-amber-800">
					{error}
				</div>
			) : null}

			{mode === "form" ? (
				<StudentForm key={prefillKey} prefill={prefill} onAnalyze={onAnalyze} loading={loading} />
			) : (
				<ProfileBuilder onComplete={onIntakeComplete} />
			)}
		</div>
	);
}
