export default function SkillGap({
  existingSkills = [],
  missingSkills = [],
  prioritySkills = []
}) {
  return (
    <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.22)] backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Skill gap analysis</p>
      <h3 className="mt-2 text-2xl font-semibold text-white">Skill alignment</h3>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-emerald-400/15 bg-emerald-400/5 p-4">
          <p className="text-sm font-semibold text-emerald-200">Existing skills</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {existingSkills.length > 0 ? existingSkills.map(skill => <span key={skill} className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm text-emerald-50">{skill}</span>) : <p className="text-sm text-slate-400">No matched skills yet.</p>}
          </div>
        </div>

        <div className="rounded-3xl border border-rose-400/15 bg-rose-400/5 p-4">
          <p className="text-sm font-semibold text-rose-200">Missing skills</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {missingSkills.length > 0 ? missingSkills.map(skill => <span key={skill} className="rounded-full bg-rose-400/15 px-3 py-1 text-sm text-rose-50">{skill}</span>) : <p className="text-sm text-slate-400">No major gaps found.</p>}
          </div>
        </div>

        <div className="rounded-3xl border border-amber-400/15 bg-amber-400/5 p-4">
          <p className="text-sm font-semibold text-amber-200">Priority skills</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {prioritySkills.length > 0 ? prioritySkills.map(skill => <span key={skill} className="rounded-full bg-amber-400/15 px-3 py-1 text-sm text-amber-50">{skill}</span>) : <p className="text-sm text-slate-400">Priority skills will appear here.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}