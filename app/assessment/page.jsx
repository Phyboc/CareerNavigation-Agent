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
				<p className="text-xs font-medium tracking-wide text-cyan-700">Assessment</p>
				<h1 className="mt-2 text-3xl font-semibold text-slate-100 sm:text-4xl">Career Profile Assessment</h1>
				<p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
					Tell us about your background and goals. CareerCompass AI will analyze your profile and generate personalized guidance.
				</p>
			</div>

			{loading ? <LoadingState message="Analyzing your profile and generating insights..." /> : null}

			{error ? (
				<div className="rounded-[28px] border border-amber-600/25 bg-amber-500/10 px-5 py-4 text-sm text-amber-800">
					{error}
				</div>
			) : null}

			<StudentForm onAnalyze={onAnalyze} loading={loading} />
		</div>
	);
}
