export default function Roadmap({ roadmap = [] }) {
  return (
    <section className="rounded-[32px] border border-slate-700/20 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,118,110,0.06)] backdrop-blur transition duration-200 hover:border-cyan-600/30 hover:shadow-[0_24px_60px_rgba(15,118,110,0.1)]">
      <p className="text-sm font-medium tracking-wide text-cyan-700">Learning roadmap</p>
      <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-100">Four-phase plan</h3>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">The roadmap stays compact on desktop and stacks naturally on smaller screens.</p>
      <div className="mt-6 grid gap-4 xl:grid-cols-4">
        {roadmap.length > 0 ? roadmap.map((phase, index) => (							<article key={`${phase.phase}-${index}`} className="rounded-3xl border border-slate-700/20 bg-slate-900/50 p-5 transition duration-200 hover:border-cyan-600/30 hover:bg-slate-900/70 flex flex-col h-full justify-between">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-cyan-700 text-sm font-bold text-white dark:from-cyan-600 dark:to-cyan-900">0{index + 1}</div>
            <h4 className="text-lg font-semibold text-slate-100">{phase.phase}</h4>
            <p className="mt-1 text-sm text-cyan-700">{phase.title}</p>
            <p className="mt-3 text-sm leading-6 text-slate-400">{phase.outcome}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {phase.items.map(item => <span key={item} className="rounded-full border border-slate-700/20 bg-white/80 px-3 py-1 text-sm text-slate-200">{item}</span>)}
            </div>
          </article>
        )) : (
          <div className="rounded-3xl border border-dashed border-slate-700/30 bg-white/60 p-5 text-sm text-slate-500 xl:col-span-4">
            The roadmap will appear after the student profile is analyzed.
          </div>
        )}
      </div>
    </section>
  );
}