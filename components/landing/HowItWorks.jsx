import Reveal from "../ui/Reveal";

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
				<p className="text-sm font-medium tracking-wide text-cyan-700">How it works</p>
				<h2 className="mt-3 font-display text-3xl font-bold text-slate-100 sm:text-4xl">Four steps from profile to plan</h2>
			</div>
			<Reveal className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				{steps.map((item, index) => (
					<Reveal key={item.step} delay={index * 0.08} className="contents">
					<article
						className="glass-card rounded-[28px] p-6 transition-all duration-300 hover:border-cyan-600/25 hover:shadow-[0_15px_30px_rgba(15,118,110,0.08)]"
					>
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-700 font-display text-sm font-black text-white shadow-[0_0_15px_rgba(15,118,110,0.2)] dark:from-cyan-600 dark:to-cyan-900">
							{item.step}
						</div>
						<h3 className="mt-5 font-display text-lg font-bold text-slate-100 leading-snug">{item.title}</h3>
						<p className="mt-2 text-sm leading-relaxed text-slate-400">{item.description}</p>
					</article>
					</Reveal>
				))}
			</Reveal>
		</section>
	);
}
