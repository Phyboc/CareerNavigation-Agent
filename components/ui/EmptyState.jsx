import Link from "next/link";

export default function EmptyState({ title = "No analysis yet", description, actionLabel = "Start Assessment", actionHref = "/assessment" }) {
	return (
		<div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-white/15 bg-white/5 px-6 py-16 text-center">
			<div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-400/10 text-2xl">
				✦
			</div>
			<h3 className="text-xl font-semibold text-white">{title}</h3>
			<p className="mt-3 max-w-md text-sm leading-7 text-slate-400">
				{description || "Complete your career assessment to unlock personalized insights, roadmaps, and recommendations."}
			</p>
			<Link
				href={actionHref}
				className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-6 text-sm font-semibold text-slate-950 transition hover:brightness-110"
			>
				{actionLabel}
			</Link>
		</div>
	);
}
