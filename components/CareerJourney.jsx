import SectionCard from "./ui/SectionCard";

const STAGES = [
	{ label: "Student", min: 0 },
	{ label: "Learner", min: 21 },
	{ label: "Builder", min: 41 },
	{ label: "Professional", min: 61 },
	{ label: "Industry Ready", min: 81 }
];

function getCurrentStageIndex(score) {
	let index = 0;
	for (let i = STAGES.length - 1; i >= 0; i--) {
		if (score >= STAGES[i].min) {
			index = i;
			break;
		}
	}
	return index;
}

export default function CareerJourney({ score = 0 }) {
	const currentIndex = getCurrentStageIndex(score);

	return (
		<SectionCard
			eyebrow="Career Journey"
			title="Your progression path"
			description="Track where you are today and what it takes to become industry ready."
		>
			<div className="mt-8 flex flex-col md:flex-row md:items-start md:justify-between relative gap-6 md:gap-0">
				{/* Desktop connector line */}
				<div className="absolute top-7 left-12 right-12 h-[2px] bg-white/5 z-0 hidden md:block" />
				
				{STAGES.map((stage, index) => {
					const active = index <= currentIndex;
					const current = index === currentIndex;

					return (
						<div key={stage.label} className="flex flex-col items-center md:flex-1 relative z-10 w-full md:w-auto">
							<div className="flex flex-col items-center">
								<div
									className={`flex h-14 w-14 items-center justify-center rounded-2xl border-2 text-base font-bold transition-all duration-300 ${
										current
											? "border-cyan-400 bg-cyan-500/20 text-cyan-100 shadow-[0_0_24px_rgba(6,182,212,0.35)]"
											: active
												? "border-cyan-500/40 bg-cyan-500/10 text-cyan-200"
												: "border-white/5 bg-slate-900/40 text-slate-500"
									}`}
								>
									{index + 1}
								</div>
								<p className={`mt-4 text-center text-sm font-semibold font-display tracking-wide ${active ? "text-white" : "text-slate-500"}`}>
									{stage.label}
								</p>
								{current ? (
									<span className="mt-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-0.5 text-[10px] uppercase font-bold tracking-wider text-cyan-300">
										You are here
									</span>
								) : null}
							</div>
							{index < STAGES.length - 1 ? (
								<div className="my-2 flex h-8 items-center md:hidden">
									<div className={`h-full w-0.5 ${active ? "bg-cyan-500/50" : "bg-white/5"}`} />
								</div>
							) : null}
						</div>
					);
				})}
			</div>
			<p className="mt-8 text-center text-sm text-slate-400">
				Current readiness: <span className="font-semibold text-cyan-300">{score}%</span> — keep building to advance to the next stage.
			</p>
		</SectionCard>
	);
}
