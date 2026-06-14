export default function ProgressBar({ value = 0, className = "", animated = false }) {
	const clamped = Math.max(0, Math.min(100, value));

	return (
		<div className={`h-3 overflow-hidden rounded-full bg-white/10 ${className}`}>
			<div
				className={`h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 transition-all duration-500 ${animated ? "animate-pulse" : ""}`}
				style={{ width: `${clamped}%` }}
			/>
		</div>
	);
}
