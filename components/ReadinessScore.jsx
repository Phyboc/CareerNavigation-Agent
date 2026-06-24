export default function ReadinessScore({
	score = 0,
	strengths = [],
	weaknesses = [],
	loading = false
}) {
	const displayScore = loading ? 0 : score;

	return (
		<section className="rounded-[32px] glass-panel p-6 sm:p-8 transition duration-300 hover:border-cyan-500/20 hover:shadow-[0_20px_50px_-12px_rgba(6,182,212,0.15)]">
			<div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
				<div className="space-y-2">
					<p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-400 font-display">Readiness Assessment</p>
					<h3 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">Career readiness score</h3>
					<p className="max-w-2xl text-sm leading-relaxed text-slate-400">Your readiness score combines skill matches, candidate project portfolio evidence, and target study consistency parameters.</p>
				</div>
				
				<div className="relative flex h-36 w-36 shrink-0 items-center justify-center rounded-full border border-cyan-500/10 bg-cyan-500/5 text-center shadow-[0_0_30px_rgba(6,182,212,0.05)]">
					<svg className="absolute inset-0 -rotate-90 h-full w-full" viewBox="0 0 120 120" aria-hidden="true">
						<circle cx="60" cy="60" r="48" className="fill-none stroke-white/5" strokeWidth="8" />
						<circle
							cx="60"
							cy="60"
							r="48"
							className="fill-none stroke-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.5)] transition-all duration-1000 ease-out"
							strokeWidth="8"
							strokeLinecap="round"
							strokeDasharray="301.59"
							strokeDashoffset={301.59 - (301.59 * displayScore) / 100}
						/>
					</svg>
					<div className="z-10">
						<p className="font-display text-4xl font-extrabold text-white tracking-tight leading-tight">{loading ? "--" : `${score}%`}</p>
						<p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">Ready</p>
					</div>
				</div>
			</div>

			<div className="mt-8">
				<div className="mb-2 flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
					<span>Progress Index</span>
					<span className="font-mono text-sm text-cyan-300 font-bold">{loading ? "Analyzing..." : `${score}%`}</span>
				</div>
				<div className="h-2.5 overflow-hidden rounded-full bg-white/5 border border-white/5">
					<div className={`h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 transition-all duration-1000 ease-out ${loading ? "animate-pulse" : ""}`} style={{ width: `${Math.max(0, Math.min(100, displayScore))}%` }} />
				</div>
			</div>

			<div className="mt-8 grid gap-5 md:grid-cols-2">
				<div className="rounded-3xl border border-emerald-500/10 bg-emerald-500/5 p-5 sm:p-6 transition duration-200 hover:border-emerald-500/20">
					<p className="font-display text-sm font-bold tracking-wide text-emerald-300 uppercase">Strengths</p>
					<div className="mt-4 flex flex-wrap gap-2">
						{loading ? (
							<p className="text-xs text-slate-500 animate-pulse">Analyzing strengths...</p>
						) : strengths.length > 0 ? (
							strengths.map(skill => (
								<span key={skill} className="rounded-xl border border-emerald-500/15 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-200">{skill}</span>
							))
						) : (
							<p className="text-xs text-slate-500">Strengths will appear after assessment.</p>
						)}
					</div>
				</div>

				<div className="rounded-3xl border border-rose-500/10 bg-rose-500/5 p-5 sm:p-6 transition duration-200 hover:border-rose-500/20">
					<p className="font-display text-sm font-bold tracking-wide text-rose-300 uppercase">Weaknesses</p>
					<div className="mt-4 flex flex-wrap gap-2">
						{loading ? (
							<p className="text-xs text-slate-500 animate-pulse">Analyzing weaknesses...</p>
						) : weaknesses.length > 0 ? (
							weaknesses.map(skill => (
								<span key={skill} className="rounded-xl border border-rose-500/15 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-200">{skill}</span>
							))
						) : (
							<p className="text-xs text-slate-500">Weaknesses will appear after assessment.</p>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}