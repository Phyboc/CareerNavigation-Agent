import Button from "../ui/Button";
import Reveal from "../ui/Reveal";

export default function Hero() {
	return (
		<Reveal>
		<section className="relative overflow-hidden rounded-[40px] border border-slate-700/20 bg-white/80 p-8 shadow-[0_30px_80px_rgba(15,118,110,0.1)] backdrop-blur sm:p-12 lg:p-16">
			<div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-600/10 blur-3xl animate-pulse-slow" />
			<div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-cyan-700/10 blur-3xl animate-pulse-slow" />

			<div className="relative max-w-3xl animate-fade-in">
				<p className="text-sm font-medium tracking-wide text-cyan-700">
					Your personal AI career mentor
				</p>
				<h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-slate-100 sm:text-5xl lg:text-6xl leading-[1.1] text-balance">
					CareerCompass AI
				</h1>
				<p className="mt-5 font-display text-lg text-cyan-800 font-medium sm:text-xl leading-relaxed">
					Discover your ideal career path, close skill gaps, and build a personalized roadmap for success.
				</p>
				<p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-400">
					Analyze your skills, gauge your project portfolio, and get AI guidance. Every step lands on a concrete milestone you can measure.
				</p>
				<div className="mt-8 flex flex-col gap-3.5 sm:flex-row">
					<Button href="/assessment" variant="primary" className="h-12 px-8">
						Start assessment
					</Button>
					<Button href="#features" variant="secondary" className="h-12 px-8">
						Explore features
					</Button>
				</div>
			</div>
		</section>
		</Reveal>
	);
}
