export default function ProgressBar({ value = 0, className = "", animated = false }) {
	const clamped = Math.max(0, Math.min(100, value));

	return (
		<div className={`h-3 overflow-hidden rounded-full bg-slate-700/25 ${className}`}>
			<div
				className={`h-full rounded-full bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 transition-all duration-500 ${animated ? "animate-pulse" : ""}`}
				style={{ width: `${clamped}%` }}
			/>
		</div>
	);
}
