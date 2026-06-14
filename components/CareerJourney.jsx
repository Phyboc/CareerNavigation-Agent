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
			<div className="mt-8 flex flex-col items-center gap-0 md:flex-row md:items-stretch md:justify-between">
				{STAGES.map((stage, index) => {
					const active = index <= currentIndex;
					const current = index === currentIndex;

					return (
						<div key={stage.label} className="flex flex-col items-center md:flex-1">
							<div className="flex flex-col items-center md:w-full">
								<div
									className={`flex h-14 w-14 items-center justify-center rounded-2xl border-2 text-sm font-bold transition duration-300 ${
										current
											? "border-cyan-300 bg-cyan-400/20 text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.3)]"
											: active
												? "border-cyan-400/40 bg-cyan-400/10 text-cyan-200"
												: "border-white/10 bg-white/5 text-slate-500"
									}`}
								>
									{index + 1}
								</div>
								<p className={`mt-3 text-center text-sm font-semibold ${active ? "text-white" : "text-slate-500"}`}>
									{stage.label}
								</p>
								{current ? (
									<span className="mt-1 rounded-full bg-cyan-400/15 px-3 py-0.5 text-xs text-cyan-200">
										You are here
									</span>
								) : null}
							</div>
							{index < STAGES.length - 1 ? (
								<div className="my-3 flex h-8 items-center md:hidden">
									<div className={`h-full w-0.5 ${active ? "bg-cyan-400/50" : "bg-white/10"}`} />
								</div>
							) : null}
							{index < STAGES.length - 1 ? (
								<div className="hidden flex-1 items-center px-2 md:flex">
									<div className={`h-0.5 w-full ${index < currentIndex ? "bg-cyan-400/50" : "bg-white/10"}`} />
								</div>
							) : null}
						</div>
					);
				})}
			</div>
			<p className="mt-6 text-center text-sm text-slate-400">
				Current readiness: <span className="font-semibold text-cyan-200">{score}%</span> — keep building to advance to the next stage.
			</p>
		</SectionCard>
	);
}
