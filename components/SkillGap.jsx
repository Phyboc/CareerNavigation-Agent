export default function SkillGap({
  existingSkills = [],
  missingSkills = [],
  prioritySkills = []
}) {
  const visibleMissingSkills = missingSkills.length > 0 ? missingSkills : [];

  return (
    <section className="rounded-[32px] border border-slate-700/20 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,118,110,0.06)] backdrop-blur transition duration-200 hover:border-cyan-600/30 hover:shadow-[0_24px_60px_rgba(15,118,110,0.1)]">
      <p className="text-sm font-medium tracking-wide text-cyan-700">Skill gap analysis</p>
      <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-100">Skill alignment</h3>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">A quick visual breakdown of what is already present, what is missing, and what should be learned first.</p>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
      <div className="rounded-3xl border border-emerald-600/20 bg-emerald-600/5 p-4 transition duration-200 hover:border-emerald-600/30 hover:bg-emerald-600/10 flex flex-col h-full justify-between">
          <p className="text-sm font-semibold tracking-wide text-emerald-700">Existing skills</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {existingSkills.length > 0 ? existingSkills.map(skill => <span key={skill} className="rounded-full bg-emerald-600/10 px-3 py-1 text-sm text-emerald-800 transition hover:bg-emerald-600/20">{skill}</span>) : <p className="text-sm text-slate-400">No matched skills yet.</p>}
          </div>
        </div>

      <div className="rounded-3xl border border-rose-600/20 bg-rose-600/5 p-4 transition duration-200 hover:border-rose-600/30 hover:bg-rose-600/10 flex flex-col h-full justify-between">
          <p className="text-sm font-semibold tracking-wide text-rose-700">Missing skills</p>
          <div className="mt-4 space-y-3">
            {visibleMissingSkills.length > 0 ? visibleMissingSkills.map((skill, index) => (
              <div key={skill} className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-600/10 text-xs font-bold text-rose-800">{index + 1}</span>
                <span className="text-sm text-rose-800">{skill}</span>
              </div>
            )) : <p className="text-sm text-slate-400">No major gaps found.</p>}
          </div>
        </div>

      <div className="rounded-3xl border border-amber-600/20 bg-amber-600/5 p-4 transition duration-200 hover:border-amber-600/30 hover:bg-amber-600/10 flex flex-col h-full justify-between">
          <p className="text-sm font-semibold tracking-wide text-amber-700">Priority skills</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {prioritySkills.length > 0 ? prioritySkills.map(skill => <span key={skill} className="rounded-full bg-amber-600/10 px-3 py-1 text-sm text-amber-800 transition hover:bg-amber-600/20">{skill}</span>) : <p className="text-sm text-slate-400">Priority skills will appear here.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}