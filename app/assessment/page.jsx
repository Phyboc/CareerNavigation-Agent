"use client";

import { useRouter } from "next/navigation";

import StudentForm from "../../components/StudentForm";
import LoadingState from "../../components/ui/LoadingState";
import { useAnalysis } from "../../context/AnalysisContext";

export default function AssessmentPage() {
	const { handleAnalyze, loading, error } = useAnalysis();
	const router = useRouter();

	const onAnalyze = async (formData) => {
		await handleAnalyze(formData);
		router.push("/analysis");
	};

	return (
		<div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
			<div>
				<p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">Assessment</p>
				<h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Career Profile Assessment</h1>
				<p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
					Tell us about your background and goals. CareerCompass AI will analyze your profile and generate personalized guidance.
				</p>
			</div>

			{loading ? <LoadingState message="Analyzing your profile and generating insights..." /> : null}

			{error ? (
				<div className="rounded-[28px] border border-amber-400/20 bg-amber-400/10 px-5 py-4 text-sm text-amber-100">
					{error}
				</div>
			) : null}

			<StudentForm onAnalyze={onAnalyze} loading={loading} />
		</div>
	);
}
