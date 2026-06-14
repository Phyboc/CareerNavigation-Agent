export default function SectionCard({ eyebrow, title, description, children, className = "" }) {
	return (
		<section
			className={`rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.22)] backdrop-blur transition duration-200 hover:-translate-y-1 hover:border-cyan-400/20 hover:shadow-[0_24px_60px_rgba(8,145,178,0.12)] ${className}`}
		>
			{eyebrow ? (
				<p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">{eyebrow}</p>
			) : null}
			{title ? <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">{title}</h3> : null}
			{description ? (
				<p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">{description}</p>
			) : null}
			{children}
		</section>
	);
}
