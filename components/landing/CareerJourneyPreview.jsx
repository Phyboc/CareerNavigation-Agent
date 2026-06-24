const stages = ["Student", "Learner", "Builder", "Professional", "Industry Ready"];

export default function CareerJourneyPreview() {
	return (
		<section className="glass-panel rounded-[32px] p-6 sm:p-8 md:p-10 transition duration-300 hover:border-cyan-500/20">
			<div className="text-center">
				<p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-400 font-display">Career Journey</p>
				<h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">Progress from student to industry ready</h2>
				<p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-400">
					Your readiness score maps to a clear progression path so you always know where you stand.
				</p>
			</div>
			<div className="mt-10 flex flex-col items-center gap-4 md:flex-row md:justify-between relative">
				{/* Horizontal connector line for desktop */}
				<div className="absolute top-6 left-8 right-8 h-0.5 bg-white/5 z-0 hidden md:block" />
				
				{stages.map((stage, index) => (
					<div key={stage} className="flex flex-col items-center md:flex-1 relative z-10 w-full md:w-auto">
						<div className="flex flex-col items-center">
							<div className={`flex h-12 w-12 items-center justify-center rounded-xl border text-sm font-bold transition duration-300 ${
								index <= 2 
									? "border-cyan-500/30 bg-cyan-500/10 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.15)]" 
									: "border-white/5 bg-slate-900/40 text-slate-500"
							}`}>
								{index + 1}
							</div>
							<p className="mt-3 font-display text-xs font-bold uppercase tracking-wider text-slate-300">{stage}</p>
						</div>
						{index < stages.length - 1 ? (
							<div className="my-2 text-slate-700 md:hidden font-bold">↓</div>
						) : null}
					</div>
				))}
			</div>
		</section>
	);
}
