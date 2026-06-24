const features = [
	{
		title: "AI Mentor Insights",
		description: "Receive personalized guidance and tailored actions generated dynamically from your candidate profile and skill matches.",
		icon: (
			<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
			</svg>
		),
		spanClass: "lg:col-span-2"
	},
	{
		title: "Career Readiness Score",
		description: "Get an instant readiness score based on candidate skill gaps, projects, and target efforts.",
		icon: (
			<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
			</svg>
		),
		spanClass: "lg:col-span-1"
	},
	{
		title: "Skill Alignment Gap",
		description: "Identify exact skills that are currently active, missing, or require priority training.",
		icon: (
			<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
			</svg>
		),
		spanClass: "lg:col-span-1"
	},
	{
		title: "Learning Roadmap",
		description: "Follow a four-phase structure from foundational engineering training up to real placement and interview prep.",
		icon: (
			<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
			</svg>
		),
		spanClass: "lg:col-span-2"
	},
	{
		title: "Resume Analyzer",
		description: "Evaluate your PDF or text resume to match target keyword strengths, certifications, and recommendations.",
		icon: (
			<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
			</svg>
		),
		spanClass: "lg:col-span-1"
	},
	{
		title: "Portfolio Recommendations",
		description: "Build real projects tailored to your target careers at beginner, intermediate, and advanced levels.",
		icon: (
			<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
			</svg>
		),
		spanClass: "lg:col-span-2"
	}
];

export default function Features() {
	return (
		<section id="features" className="scroll-mt-24">
			<div className="text-center">
				<p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-400 font-display">Features</p>
				<h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">Navigate your career with confidence</h2>
				<p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-400">
					CareerCompass AI compiles candidate profiles, identifies missing alignments, and generates study plans.
				</p>
			</div>
			<div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
				{features.map((feature, idx) => (
					<article
						key={feature.title}
						className={`rounded-3xl border border-white/5 bg-slate-900/20 p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/25 hover:bg-slate-900/40 hover:shadow-[0_15px_35px_rgba(6,182,212,0.08)] ${feature.spanClass || ""}`}
					>
						<span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
							{feature.icon}
						</span>
						<h3 className="mt-5 font-display text-lg font-bold text-white leading-snug">{feature.title}</h3>
						<p className="mt-2 text-sm leading-relaxed text-slate-400">{feature.description}</p>
					</article>
				))}
			</div>
		</section>
	);
}
