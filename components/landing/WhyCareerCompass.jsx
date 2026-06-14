const problems = [
	"Choose a career path with confidence",
	"Understand their readiness for target roles",
	"Identify missing skills quickly",
	"Create a structured learning plan"
];

const solutions = [
	"AI-driven profile and readiness analysis",
	"Skill gap detection with priority ranking",
	"Personalized roadmaps and weekly study plans",
	"Resume analysis and project recommendations"
];

export default function WhyCareerCompass() {
	return (
		<section id="why" className="scroll-mt-24 rounded-[32px] border border-white/10 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-400/5 p-8 sm:p-10">
			<div className="text-center">
				<p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">Why CareerCompass AI?</p>
				<h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Built for students who want clarity</h2>
			</div>
			<div className="mt-10 grid gap-8 lg:grid-cols-2">
				<div>
					<h3 className="text-lg font-semibold text-rose-200">Students often struggle to</h3>
					<ul className="mt-4 space-y-3">
						{problems.map(item => (
							<li key={item} className="flex items-start gap-3 text-sm leading-7 text-slate-300">
								<span className="mt-1 text-rose-400">✕</span>
								{item}
							</li>
						))}
					</ul>
				</div>
				<div>
					<h3 className="text-lg font-semibold text-emerald-200">CareerCompass AI solves this through</h3>
					<ul className="mt-4 space-y-3">
						{solutions.map(item => (
							<li key={item} className="flex items-start gap-3 text-sm leading-7 text-slate-300">
								<span className="mt-1 text-emerald-400">✓</span>
								{item}
							</li>
						))}
					</ul>
				</div>
			</div>
		</section>
	);
}
