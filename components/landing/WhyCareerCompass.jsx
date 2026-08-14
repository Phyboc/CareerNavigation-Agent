const problems = [
	"Not knowing which role actually fits their skills and interests",
	"No sense of real readiness or the credentials target roles expect",
	"Discovering skill gaps only after interviews go wrong",
	"Struggling to turn a broad goal into a day-by-day study schedule"
];

const solutions = [
	"AI-driven profile evaluation with an instant readiness index",
	"Automatic skill gap analysis ranked by career priorities",
	"Step-by-step roadmaps coupled with granular weekly study plans",
	"Interactive resume keyword checking and portfolio project alignment"
];

export default function WhyCareerCompass() {
	return (
		<section id="why" className="scroll-mt-24 glass-panel rounded-[32px] p-6 sm:p-10 transition duration-300 hover:border-cyan-600/25">
			<div className="text-center">
				<p className="text-sm font-medium tracking-wide text-cyan-700">Why CareerCompass AI?</p>
				<h2 className="mt-3 font-display text-3xl font-bold text-slate-100 sm:text-4xl">Built for students who want direction</h2>
			</div>
			<div className="mt-10 grid gap-6 lg:grid-cols-2">
				<div className="rounded-3xl border border-rose-600/15 bg-rose-600/5 p-6 sm:p-8 hover:border-rose-600/30 transition duration-300">
					<h3 className="font-display text-lg font-bold text-rose-700">Students often struggle to</h3>
					<ul className="mt-6 space-y-4">
						{problems.map((item, idx) => (
							<li key={idx} className="flex items-start gap-3.5 text-sm leading-relaxed text-slate-300">
								<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
									<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</span>
								{item}
							</li>
						))}
					</ul>
				</div>
				<div className="rounded-3xl border border-emerald-600/15 bg-emerald-600/5 p-6 sm:p-8 hover:border-emerald-600/30 transition duration-300">
					<h3 className="font-display text-lg font-bold text-emerald-700">CareerCompass AI solves this through</h3>
					<ul className="mt-6 space-y-4">
						{solutions.map((item, idx) => (
							<li key={idx} className="flex items-start gap-3.5 text-sm leading-relaxed text-slate-300">
								<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
									<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
									</svg>
								</span>
								{item}
							</li>
						))}
					</ul>
				</div>
			</div>
		</section>
	);
}
