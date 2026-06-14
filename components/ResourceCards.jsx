function ResourceList({ title, items, tone }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4 transition duration-200 hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-slate-950/90">
      <p className={`text-sm font-semibold tracking-wide ${tone}`}>{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map(item => (
          <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-100 transition hover:bg-white/10">{item}</span>
        ))}
      </div>
    </div>
  );
}

export default function ResourceCards({ resources }) {
  if (!resources) return null;

  return (
    <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.22)] backdrop-blur transition duration-200 hover:-translate-y-1 hover:border-cyan-400/20 hover:shadow-[0_24px_60px_rgba(8,145,178,0.12)]">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">Recommended resources</p>
      <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">Courses, documentation, practice, and channels</h3>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">A clean list of trusted resources to support the selected career direction.</p>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ResourceList title="Courses" items={resources.courses} tone="text-emerald-200" />
        <ResourceList title="Documentation" items={resources.documentation} tone="text-sky-200" />
        <ResourceList title="Practice Platforms" items={resources.practicePlatforms} tone="text-amber-200" />
        <ResourceList title="YouTube Channels" items={resources.youtubeChannels} tone="text-rose-200" />
      </div>
    </section>
  );
}