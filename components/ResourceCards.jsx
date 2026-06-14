function ResourceList({ title, items, tone }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
      <p className={`text-sm font-semibold ${tone}`}>{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map(item => (
          <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-100">{item}</span>
        ))}
      </div>
    </div>
  );
}

export default function ResourceCards({ resources }) {
  if (!resources) return null;

  return (
    <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.22)] backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Recommended resources</p>
      <h3 className="mt-2 text-2xl font-semibold text-white">Courses, documentation, practice, and channels</h3>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ResourceList title="Courses" items={resources.courses} tone="text-emerald-200" />
        <ResourceList title="Documentation" items={resources.documentation} tone="text-sky-200" />
        <ResourceList title="Practice Platforms" items={resources.practicePlatforms} tone="text-amber-200" />
        <ResourceList title="YouTube Channels" items={resources.youtubeChannels} tone="text-rose-200" />
      </div>
    </section>
  );
}