export default function ReadinessScore({
  score = 0,
  strengths = [],
  weaknesses = [],
  loading = false
}) {
  const displayScore = loading ? 0 : score;

  return (
    <section className="rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.22)] backdrop-blur transition duration-200 hover:-translate-y-1 hover:border-cyan-400/20 hover:shadow-[0_24px_60px_rgba(8,145,178,0.12)]">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">Readiness assessment</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">Career readiness score</h3>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">The score combines skill match, project signal, and study consistency to give a fast, demo-friendly view of fit.</p>
        </div>
        <div className="relative flex h-32 w-32 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10 text-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="48" className="fill-none stroke-white/10" strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r="48"
              className="fill-none stroke-cyan-300"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray="301.59"
              strokeDashoffset={301.59 - (301.59 * displayScore) / 100}
            />
          </svg>
          <div>
            <p className="text-4xl font-bold text-white">{loading ? "--" : `${score}%`}</p>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">Ready</p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
          <span>Progress bar</span>
          <span>{loading ? "Loading..." : `${score}%`}</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-white/10">
          <div className={`h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 transition-all duration-500 ${loading ? "animate-pulse" : ""}`} style={{ width: `${Math.max(0, Math.min(100, displayScore))}%` }} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-emerald-400/15 bg-emerald-400/5 p-4 transition duration-200 hover:border-emerald-400/30 hover:bg-emerald-400/8">
          <p className="text-sm font-semibold tracking-wide text-emerald-200">Strengths</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {loading ? <p className="text-sm text-slate-400">Analyzing strengths...</p> : strengths.length > 0 ? strengths.map(skill => (
              <span key={skill} className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm text-emerald-50">{skill}</span>
            )) : <p className="text-sm text-slate-400">Strengths will appear after analysis.</p>}
          </div>
        </div>

        <div className="rounded-3xl border border-rose-400/15 bg-rose-400/5 p-4 transition duration-200 hover:border-rose-400/30 hover:bg-rose-400/8">
          <p className="text-sm font-semibold tracking-wide text-rose-200">Weaknesses</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {loading ? <p className="text-sm text-slate-400">Analyzing weaknesses...</p> : weaknesses.length > 0 ? weaknesses.map(skill => (
              <span key={skill} className="rounded-full bg-rose-400/15 px-3 py-1 text-sm text-rose-50">{skill}</span>
            )) : <p className="text-sm text-slate-400">Weaknesses will appear after analysis.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}