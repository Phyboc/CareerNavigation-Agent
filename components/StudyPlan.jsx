export default function StudyPlan({ weeklySchedule = [] }) {
  return (		<section className="rounded-[32px] border border-slate-700/20 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,118,110,0.06)] backdrop-blur">
      <p className="text-sm font-medium tracking-wide text-cyan-700">Weekly study plan</p>
      <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-100">Monday to Sunday</h3>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">A practical weekly cadence that spreads work across the week without feeling overloaded.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-7">
        {weeklySchedule.length > 0 ? weeklySchedule.map(day => (					<div key={day.day} className="rounded-3xl border border-slate-700/20 bg-white/80 p-4 transition duration-200 hover:border-cyan-600/30 hover:bg-white flex flex-col h-full justify-between">
            <p className="text-sm font-semibold text-slate-100">{day.day}</p>
            <p className="mt-2 text-sm text-cyan-700">{day.focus}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-500">{day.hours} hours</p>
            <p className="mt-3 text-sm leading-6 text-slate-400">{day.task}</p>
          </div>
        )) : (
          <div className="rounded-3xl border border-dashed border-slate-700/30 bg-white/60 p-5 text-sm text-slate-500 md:col-span-2 xl:col-span-7">
            Weekly study blocks will appear after analysis.
          </div>
        )}
      </div>
    </section>
  );
}