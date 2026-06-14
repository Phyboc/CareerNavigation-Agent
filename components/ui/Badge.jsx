const tones = {
	emerald: "bg-emerald-400/15 text-emerald-50 border-emerald-400/20",
	sky: "bg-sky-400/15 text-sky-50 border-sky-400/20",
	rose: "bg-rose-400/15 text-rose-50 border-rose-400/20",
	amber: "bg-amber-400/15 text-amber-50 border-amber-400/20",
	cyan: "bg-cyan-400/15 text-cyan-50 border-cyan-400/20",
	slate: "bg-slate-950/70 text-slate-200 border-white/10"
};

export default function Badge({ children, tone = "slate", className = "" }) {
	return (
		<span
			className={`inline-flex rounded-full border px-3 py-1 text-sm transition hover:brightness-110 ${tones[tone] || tones.slate} ${className}`}
		>
			{children}
		</span>
	);
}
