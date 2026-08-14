function ResourceList({ title, items, tone }) {
  return (
    <div className="rounded-3xl border border-slate-700/20 bg-white/80 p-4 transition duration-200 hover:border-cyan-600/30 hover:bg-white">
      <p className={`text-sm font-semibold tracking-wide ${tone}`}>{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map(item => (
          <span key={item} className="rounded-full border border-slate-700/20 bg-slate-900/60 px-3 py-1 text-sm text-slate-200 transition hover:bg-slate-900">{item}</span>
        ))}
      </div>
    </div>
  );
}

export default function ResourceCards({ resources }) {
  if (!resources) return null;

  return (
    <section className="rounded-[32px] border border-slate-700/20 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,118,110,0.06)] backdrop-blur">
      <p className="text-sm font-medium tracking-wide text-cyan-700">Recommended resources</p>
      <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-100">Courses, documentation, practice, and channels</h3>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">A clean list of trusted resources to support the selected career direction.</p>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ResourceList title="Courses" items={resources.courses} tone="text-emerald-700" />
        <ResourceList title="Documentation" items={resources.documentation} tone="text-sky-700" />
        <ResourceList title="Practice Platforms" items={resources.practicePlatforms} tone="text-amber-700" />
        <ResourceList title="YouTube Channels" items={resources.youtubeChannels} tone="text-rose-700" />
      </div>
    </section>
  );
}