"use client";

import { useAnalysis } from "../context/AnalysisContext";

export default function ExportReportButton({ className = "" }) {
	const { analysis, exportReport } = useAnalysis();

	if (!analysis) return null;

	return (
		<button
			type="button"
			onClick={exportReport}
			className={`inline-flex h-11 items-center justify-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-5 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20 ${className}`}
		>
			<span aria-hidden="true">↓</span>
			Export Career Report
		</button>
	);
}
