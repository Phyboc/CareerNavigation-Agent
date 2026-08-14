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
					<p className="text-sm font-medium tracking-wide text-cyan-700">Readiness assessment</p>
					<h3 className="font-display text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">Career readiness score</h3>
					<p className="max-w-2xl text-sm leading-relaxed text-slate-400">Your readiness score combines skill matches, candidate project portfolio evidence, and target study consistency parameters.</p>
				</div>
				
				<div className="relative flex h-36 w-36 shrink-0 items-center justify-center rounded-full border border-cyan-500/10 bg-cyan-500/5 text-center shadow-[0_0_30px_rgba(6,182,212,0.05)]">
					<svg className="absolute inset-0 -rotate-90 h-full w-full" viewBox="0 0 120 120" aria-hidden="true">
						<circle cx="60" cy="60" r="48" className="fill-none stroke-slate-700/20" strokeWidth="8" />
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
						<p className="font-display text-4xl font-extrabold text-slate-100 tracking-tight leading-tight">{loading ? "--" : `${score}%`}</p>
						<p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-700">Ready</p>
					</div>
				</div>
			</div>

			<div className="mt-8">
				<div className="mb-2 flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
					<span>Progress Index</span>
					<span className="font-mono text-sm text-cyan-700 font-bold">{loading ? "Analyzing..." : `${score}%`}</span>
				</div>
				<div className="h-2.5 overflow-hidden rounded-full bg-slate-700/20 border border-slate-700/15">
					<div className={`h-full rounded-full bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 transition-all duration-1000 ease-out ${loading ? "animate-pulse" : ""}`} style={{ width: `${Math.max(0, Math.min(100, displayScore))}%` }} />
				</div>
			</div>

			<div className="mt-8 grid gap-5 md:grid-cols-2">
				<div className="rounded-3xl border border-emerald-500/10 bg-emerald-500/5 p-5 sm:p-6 transition duration-200 hover:border-emerald-500/20">
					<p className="font-display text-sm font-bold tracking-wide text-emerald-700 uppercase">Strengths</p>
					<div className="mt-4 flex flex-wrap gap-2">
						{loading ? (
							<p className="text-xs text-slate-500 animate-pulse">Analyzing strengths...</p>
						) : strengths.length > 0 ? (
							strengths.map(skill => (
								<span key={skill} className="rounded-xl border border-emerald-600/20 bg-emerald-600/10 px-3 py-1.5 text-xs font-medium text-emerald-800">{skill}</span>
							))
						) : (
							<p className="text-xs text-slate-500">Strengths will appear after assessment.</p>
						)}
					</div>
				</div>

				<div className="rounded-3xl border border-rose-500/10 bg-rose-500/5 p-5 sm:p-6 transition duration-200 hover:border-rose-500/20">
					<p className="font-display text-sm font-bold tracking-wide text-rose-700 uppercase">Weaknesses</p>
					<div className="mt-4 flex flex-wrap gap-2">
						{loading ? (
							<p className="text-xs text-slate-500 animate-pulse">Analyzing weaknesses...</p>
						) : weaknesses.length > 0 ? (
							weaknesses.map(skill => (
								<span key={skill} className="rounded-xl border border-rose-600/20 bg-rose-600/10 px-3 py-1.5 text-xs font-medium text-rose-800">{skill}</span>
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