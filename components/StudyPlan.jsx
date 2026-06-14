export default function StudyPlan({ weeklySchedule = [] }) {
  return (
    <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.22)] backdrop-blur transition duration-200 hover:-translate-y-1 hover:border-cyan-400/20 hover:shadow-[0_24px_60px_rgba(8,145,178,0.12)]">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">Weekly study plan</p>
      <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">Monday to Sunday</h3>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">A practical weekly cadence that spreads work across the week without feeling overloaded.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-7">
        {weeklySchedule.length > 0 ? weeklySchedule.map(day => (
          <div key={day.day} className="rounded-3xl border border-white/10 bg-slate-950/70 p-4 transition duration-200 hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-slate-950/90">
            <p className="text-sm font-semibold text-white">{day.day}</p>
            <p className="mt-2 text-sm text-cyan-200">{day.focus}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-500">{day.hours} hours</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">{day.task}</p>
          </div>
        )) : (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-5 text-sm text-slate-400 md:col-span-2 xl:col-span-7">
            Weekly study blocks will appear after analysis.
          </div>
        )}
      </div>
    </section>
  );
}