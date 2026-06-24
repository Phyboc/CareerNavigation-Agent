const problems = [
	"Choosing a career path with clarity and data-backed confidence",
	"Understanding actual readiness and missing credentials for target roles",
	"Identifying critical skill gaps early in the learning journey",
	"Creating structured, day-by-day learning schedules that fit personal hours"
];

const solutions = [
	"AI-driven profile evaluation with an instant readiness index",
	"Automatic skill gap analysis ranked by career priorities",
	"Step-by-step roadmaps coupled with granular weekly study plans",
	"Interactive resume keyword checking and portfolio project alignment"
];

export default function WhyCareerCompass() {
	return (
		<section id="why" className="scroll-mt-24 glass-panel rounded-[32px] p-6 sm:p-10 transition duration-300 hover:border-cyan-500/20">
			<div className="text-center">
				<p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-400 font-display">Why CareerCompass AI?</p>
				<h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">Built for students who want clarity</h2>
			</div>
			<div className="mt-10 grid gap-6 lg:grid-cols-2">
				<div className="rounded-3xl border border-rose-500/10 bg-rose-500/5 p-6 sm:p-8 hover:border-rose-500/25 transition duration-300">
					<h3 className="font-display text-lg font-bold text-rose-300">Students often struggle to</h3>
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
				<div className="rounded-3xl border border-emerald-500/10 bg-emerald-500/5 p-6 sm:p-8 hover:border-emerald-500/25 transition duration-300">
					<h3 className="font-display text-lg font-bold text-emerald-300">CareerCompass AI solves this through</h3>
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
