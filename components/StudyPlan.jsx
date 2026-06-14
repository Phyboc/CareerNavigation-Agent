export default function StudyPlan({ weeklySchedule = [] }) {
  return (
    <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.22)] backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Weekly study plan</p>
      <h3 className="mt-2 text-2xl font-semibold text-white">Monday to Sunday</h3>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-7">
        {weeklySchedule.map(day => (
          <div key={day.day} className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
            <p className="text-sm font-semibold text-white">{day.day}</p>
            <p className="mt-2 text-sm text-cyan-200">{day.focus}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-500">{day.hours} hours</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">{day.task}</p>
          </div>
        ))}
      </div>
    </section>
  );
}