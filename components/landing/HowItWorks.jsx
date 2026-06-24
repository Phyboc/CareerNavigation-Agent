const steps = [
	{ step: "01", title: "Complete Assessment", description: "Enter your skills, degree, projects, and target career goal." },
	{ step: "02", title: "Get AI Analysis", description: "Receive instant readiness scores, alternative matches, and skill gaps." },
	{ step: "03", title: "Follow Your Roadmap", description: "Execute your structured learning roadmap and personalized study plan." },
	{ step: "04", title: "Build & Apply", description: "Build recommended portfolio projects and evaluate resume keyword fit." }
];

export default function HowItWorks() {
	return (
		<section id="how-it-works" className="scroll-mt-24">
			<div className="text-center">
				<p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-400 font-display">How It Works</p>
				<h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">Four steps to career clarity</h2>
			</div>
			<div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				{steps.map(item => (
					<article
						key={item.step}
						className="glass-card rounded-[28px] p-6 transition-all duration-300 hover:border-cyan-500/20 hover:shadow-[0_15px_30px_rgba(6,182,212,0.06)]"
					>
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 font-display text-sm font-black text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
							{item.step}
						</div>
						<h3 className="mt-5 font-display text-lg font-bold text-white leading-snug">{item.title}</h3>
						<p className="mt-2 text-sm leading-relaxed text-slate-400">{item.description}</p>
					</article>
				))}
			</div>
		</section>
	);
}
