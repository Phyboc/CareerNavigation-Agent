export default function ProjectRecommendations({ careerGoal = "AI Engineer", projects = {} }) {
  if (!projects) return null;

  const tiers = [
    { key: "beginner", tone: "text-emerald-200", label: "Beginner" },
    { key: "intermediate", tone: "text-sky-200", label: "Intermediate" },
    { key: "advanced", tone: "text-amber-200", label: "Advanced" }
  ];

  return (
    <section className="rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.22)] backdrop-blur transition duration-200 hover:-translate-y-1 hover:border-cyan-400/20 hover:shadow-[0_24px_60px_rgba(8,145,178,0.12)]">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">Recommended projects</p>
      <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">Project ideas for {careerGoal}</h3>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">Each project is mapped to a difficulty stage so students can build confidence step by step.</p>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {tiers.map((tier) => {
          const project = projects[tier.key];
          if (!project) {
            return (
              <article key={tier.key} className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-5 text-sm text-slate-400">
                <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${tier.tone}`}>{tier.label}</p>
                <p className="mt-3">No {tier.label.toLowerCase()} project recommendation available yet.</p>
              </article>
            );
          }

          return (
            <article key={tier.key} className="rounded-3xl border border-white/10 bg-white/5 p-5 transition duration-200 hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-white/7 hover:shadow-[0_18px_40px_rgba(8,145,178,0.12)]">
              <div className="flex items-center justify-between gap-3">
                <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${tier.tone}`}>{tier.label}</p>
                <span className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-xs font-semibold text-slate-100">Project</span>
              </div>

              <h4 className="mt-3 text-lg font-semibold text-white">{project.title}</h4>
              <p className="mt-2 text-sm leading-6 text-slate-300">{project.description}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {project.skills.map((skill) => (
                  <span key={skill} className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-sm text-slate-200">{skill}</span>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}