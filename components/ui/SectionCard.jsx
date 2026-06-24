export default function SectionCard({ eyebrow, title, description, children, className = "" }) {
	return (
		<section
			className={`rounded-[32px] glass-panel p-6 sm:p-8 transition duration-300 hover:border-cyan-500/20 hover:shadow-[0_20px_50px_-12px_rgba(6,182,212,0.15)] ${className}`}
		>
			{eyebrow ? (
				<p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-400 font-display">{eyebrow}</p>
			) : null}
			{title ? <h3 className="mt-2 text-2xl font-bold tracking-tight text-white font-display sm:text-3xl">{title}</h3> : null}
			{description ? (
				<p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">{description}</p>
			) : null}
			{children}
		</section>
	);
}
