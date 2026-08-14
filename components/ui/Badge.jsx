const tones = {
	emerald: "bg-emerald-500/10 text-emerald-700 border-emerald-600/25",
	sky: "bg-sky-500/10 text-sky-700 border-sky-600/25",
	rose: "bg-rose-500/10 text-rose-700 border-rose-600/25",
	amber: "bg-amber-500/10 text-amber-700 border-amber-600/25",
	cyan: "bg-cyan-500/10 text-cyan-700 border-cyan-600/25",
	slate: "bg-slate-800/40 text-slate-200 border-slate-700/30"
};

export default function Badge({ children, tone = "slate", className = "" }) {
	return (
		<span
			className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide transition hover:brightness-110 ${tones[tone] || tones.slate} ${className}`}
		>
			{children}
		</span>
	);
}
