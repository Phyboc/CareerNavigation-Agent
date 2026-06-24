const tones = {
	emerald: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
	sky: "bg-sky-500/10 text-sky-300 border-sky-500/20",
	rose: "bg-rose-500/10 text-rose-300 border-rose-500/20",
	amber: "bg-amber-500/10 text-amber-300 border-amber-500/20",
	cyan: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
	slate: "bg-slate-800/40 text-slate-300 border-white/5"
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
