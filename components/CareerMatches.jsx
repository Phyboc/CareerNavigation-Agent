export default function CareerMatches({ matches = [], selectedCareer = "" }) {
  return (
    <section className="rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.22)] backdrop-blur transition duration-200 hover:-translate-y-1 hover:border-cyan-400/20 hover:shadow-[0_24px_60px_rgba(8,145,178,0.12)]">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">Career match ranking</p>
      <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">Top 3 matching careers</h3>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">The ranking is based on keyword overlap between the entered skills and each career path requirement set.</p>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {matches.length > 0 ? matches.map((match, index) => (
          <article key={match.career} className={`group rounded-3xl border p-5 transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(8,145,178,0.12)] ${match.career === selectedCareer ? "border-cyan-400/30 bg-cyan-400/10" : "border-white/10 bg-white/5 hover:border-cyan-400/20 hover:bg-white/7"}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Rank #{index + 1}</p>
                <h4 className="mt-2 text-lg font-semibold text-white">{match.career}</h4>
              </div>
              <span className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-sm font-semibold text-slate-100 transition group-hover:border-cyan-400/30 group-hover:bg-cyan-400/10">{match.score}%</span>
            </div>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500" style={{ width: `${Math.max(0, Math.min(100, match.score))}%` }} />
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <p><span className="font-medium text-slate-100">Matched skills:</span> {match.matchedSkills.length > 0 ? match.matchedSkills.join(", ") : "None yet"}</p>
              <p><span className="font-medium text-slate-100">Missing skills:</span> {match.missingSkills.length > 0 ? match.missingSkills.slice(0, 3).join(", ") : "None"}</p>
            </div>

            {match.career === selectedCareer ? (
              <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
                Selected target career
              </div>
            ) : null}
          </article>
        )) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-400 lg:col-span-3">
            No career matches available yet. Enter skills to generate ranked careers.
          </div>
        )}
      </div>
    </section>
  );
}