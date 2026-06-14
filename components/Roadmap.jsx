export default function Roadmap({ roadmap = [] }) {
  return (
    <section className="rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.22)] backdrop-blur transition duration-200 hover:-translate-y-1 hover:border-cyan-400/20 hover:shadow-[0_24px_60px_rgba(8,145,178,0.12)]">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">Learning roadmap</p>
      <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">Four-phase plan</h3>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">The roadmap stays compact on desktop and stacks naturally on smaller screens.</p>
      <div className="mt-6 grid gap-4 xl:grid-cols-4">
        {roadmap.length > 0 ? roadmap.map((phase, index) => (
          <article key={`${phase.phase}-${index}`} className="rounded-3xl border border-white/10 bg-white/5 p-5 transition duration-200 hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-white/7">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-sm font-bold text-slate-950">0{index + 1}</div>
            <h4 className="text-lg font-semibold text-white">{phase.phase}</h4>
            <p className="mt-1 text-sm text-cyan-200">{phase.title}</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">{phase.outcome}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {phase.items.map(item => <span key={item} className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-sm text-slate-200">{item}</span>)}
            </div>
          </article>
        )) : (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-5 text-sm text-slate-400 xl:col-span-4">
            The roadmap will appear after the student profile is analyzed.
          </div>
        )}
      </div>
    </section>
  );
}