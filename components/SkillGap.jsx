export default function SkillGap({
  existingSkills = [],
  missingSkills = [],
  prioritySkills = []
}) {
  const visibleMissingSkills = missingSkills.length > 0 ? missingSkills : [];

  return (
    <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.22)] backdrop-blur transition duration-200 hover:-translate-y-1 hover:border-cyan-400/20 hover:shadow-[0_24px_60px_rgba(8,145,178,0.12)]">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">Skill gap analysis</p>
      <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">Skill alignment</h3>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">A quick visual breakdown of what is already present, what is missing, and what should be learned first.</p>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
      <div className="rounded-3xl border border-emerald-400/15 bg-emerald-400/5 p-4 transition duration-200 hover:border-emerald-400/30 hover:bg-emerald-400/8 flex flex-col h-full justify-between">
          <p className="text-sm font-semibold tracking-wide text-emerald-200">Existing skills</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {existingSkills.length > 0 ? existingSkills.map(skill => <span key={skill} className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm text-emerald-50 transition hover:bg-emerald-400/25">{skill}</span>) : <p className="text-sm text-slate-400">No matched skills yet.</p>}
          </div>
        </div>

      <div className="rounded-3xl border border-rose-400/15 bg-rose-400/5 p-4 transition duration-200 hover:border-rose-400/30 hover:bg-rose-400/8 flex flex-col h-full justify-between">
          <p className="text-sm font-semibold tracking-wide text-rose-200">Missing skills</p>
          <div className="mt-4 space-y-3">
            {visibleMissingSkills.length > 0 ? visibleMissingSkills.map((skill, index) => (
              <div key={skill}>
                <div className="mb-1 flex items-center justify-between text-xs text-rose-100/80">
                  <span>{skill}</span>
                  <span>{Math.max(35, 100 - index * 18)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-rose-950/60">
                  <div className="h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-300" style={{ width: `${Math.max(35, 100 - index * 18)}%` }} />
                </div>
              </div>
            )) : <p className="text-sm text-slate-400">No major gaps found.</p>}
          </div>
        </div>

      <div className="rounded-3xl border border-amber-400/15 bg-amber-400/5 p-4 transition duration-200 hover:border-amber-400/30 hover:bg-amber-400/8 flex flex-col h-full justify-between">
          <p className="text-sm font-semibold tracking-wide text-amber-200">Priority skills</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {prioritySkills.length > 0 ? prioritySkills.map(skill => <span key={skill} className="rounded-full bg-amber-400/15 px-3 py-1 text-sm text-amber-50 transition hover:bg-amber-400/25">{skill}</span>) : <p className="text-sm text-slate-400">Priority skills will appear here.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}