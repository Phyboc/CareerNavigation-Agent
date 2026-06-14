const steps = [
	{ step: "01", title: "Complete Assessment", description: "Enter your skills, degree, projects, and career goal." },
	{ step: "02", title: "Get AI Analysis", description: "Receive readiness scores, career matches, and skill gap insights." },
	{ step: "03", title: "Follow Your Roadmap", description: "Use your personalized learning plan and weekly study schedule." },
	{ step: "04", title: "Build & Apply", description: "Complete recommended projects and refine your resume for your target role." }
];

export default function HowItWorks() {
	return (
		<section id="how-it-works" className="scroll-mt-24">
			<div className="text-center">
				<p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">How It Works</p>
				<h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Four steps to career clarity</h2>
			</div>
			<div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{steps.map(item => (
					<article key={item.step} className="rounded-3xl border border-white/10 bg-white/5 p-6">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-sm font-bold text-slate-950">
							{item.step}
						</div>
						<h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
						<p className="mt-2 text-sm leading-7 text-slate-400">{item.description}</p>
					</article>
				))}
			</div>
		</section>
	);
}
