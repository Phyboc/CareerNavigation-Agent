const stages = ["Student", "Learner", "Builder", "Professional", "Industry Ready"];

export default function CareerJourneyPreview() {
	return (
		<section className="rounded-[32px] border border-white/10 bg-slate-950/80 p-8">
			<div className="text-center">
				<p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">Career Journey</p>
				<h2 className="mt-3 text-3xl font-semibold text-white">Progress from student to industry ready</h2>
				<p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400">
					Your readiness score maps to a clear progression path so you always know where you stand.
				</p>
			</div>
			<div className="mt-10 flex flex-col items-center gap-2 md:flex-row md:justify-between">
				{stages.map((stage, index) => (
					<div key={stage} className="flex flex-col items-center md:flex-1">
						<div className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-sm font-bold ${index <= 2 ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-200" : "border-white/10 bg-white/5 text-slate-500"}`}>
							{index + 1}
						</div>
						<p className="mt-2 text-xs font-semibold text-slate-300">{stage}</p>
						{index < stages.length - 1 ? (
							<span className="my-1 text-slate-600 md:hidden">↓</span>
						) : null}
					</div>
				))}
			</div>
		</section>
	);
}
