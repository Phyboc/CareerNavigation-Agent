import Button from "../ui/Button";

export default function Hero() {
	return (
		<section className="relative overflow-hidden rounded-[40px] border border-white/10 bg-white/5 p-8 shadow-[0_30px_80px_rgba(2,6,23,0.28)] backdrop-blur sm:p-12 lg:p-16">
			<div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl animate-pulse-slow" />
			<div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-blue-500/15 blur-3xl animate-pulse-slow" />

			<div className="relative max-w-3xl animate-fade-in">
				<p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">
					Your Personal AI Career Mentor
				</p>
				<h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
					CareerCompass AI
				</h1>
				<p className="mt-4 text-lg text-cyan-100 sm:text-xl">
					Discover Your Ideal Career Path, Close Skill Gaps, and Build a Roadmap for Success.
				</p>
				<p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
					Analyze your skills, discover career opportunities, identify gaps, and receive personalized guidance powered by AI.
				</p>
				<div className="mt-8 flex flex-col gap-3 sm:flex-row">
					<Button href="/assessment" variant="primary" className="h-12 px-7">
						Start Assessment
					</Button>
					<Button href="#features" variant="secondary" className="h-12 px-7">
						Explore Features
					</Button>
				</div>
			</div>
		</section>
	);
}
