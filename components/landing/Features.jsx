const features = [
	{
		title: "Career Readiness Score",
		description: "Get an instant readiness score based on your skills, projects, and study consistency.",
		icon: "◎"
	},
	{
		title: "Skill Gap Analysis",
		description: "See exactly which skills you have, which are missing, and what to learn first.",
		icon: "◈"
	},
	{
		title: "AI Mentor Insights",
		description: "Receive natural language guidance tailored to your profile and career goals.",
		icon: "✦"
	},
	{
		title: "Learning Roadmap",
		description: "Follow a structured four-phase plan from foundations to interview readiness.",
		icon: "→"
	},
	{
		title: "Resume Analyzer",
		description: "Paste your resume and get strengths, gaps, and career fit recommendations.",
		icon: "▣"
	},
	{
		title: "Project Recommendations",
		description: "Build portfolio projects at beginner, intermediate, and advanced levels.",
		icon: "◆"
	}
];

export default function Features() {
	return (
		<section id="features" className="scroll-mt-24">
			<div className="text-center">
				<p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">Features</p>
				<h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Everything you need to navigate your career</h2>
				<p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400">
					CareerCompass AI combines analysis, planning, and AI mentorship in one platform.
				</p>
			</div>
			<div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{features.map(feature => (
					<article
						key={feature.title}
						className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 transition duration-200 hover:-translate-y-1 hover:border-cyan-400/25 hover:bg-slate-950/80"
					>
						<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-lg text-cyan-300">
							{feature.icon}
						</span>
						<h3 className="mt-4 text-lg font-semibold text-white">{feature.title}</h3>
						<p className="mt-2 text-sm leading-7 text-slate-400">{feature.description}</p>
					</article>
				))}
			</div>
		</section>
	);
}
