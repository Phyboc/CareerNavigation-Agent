import Badge from "./ui/Badge";
import ProgressBar from "./ui/ProgressBar";
import SectionCard from "./ui/SectionCard";

export default function CareerMatches({ matches = [], selectedCareer = "" }) {
	return (
		<SectionCard
			eyebrow="Career Match Ranking"
			title="Top 3 matching careers"
			description="Ranked by skill alignment with required skills, missing gaps, and estimated learning effort."
		>
			<div className="mt-6 grid gap-6 lg:grid-cols-3">
				{matches.length > 0 ? matches.map((match, index) => {
					const isTarget = match.career === selectedCareer;
					// Editorial stagger: middle card sits lower, last card lower still.
					const stagger = index === 1 ? "lg:translate-y-4" : index === 2 ? "lg:translate-y-8" : "";
					return (
						<article
							key={match.career}
							className={`group rounded-3xl border p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_-12px_rgba(15,118,110,0.15)] ${stagger} ${
								isTarget
									? "border-cyan-600/35 bg-cyan-600/5 shadow-[0_10px_30px_rgba(15,118,110,0.06)]"
									: "border-slate-700/20 bg-white/70 hover:border-cyan-600/25 hover:bg-white"
							}`}
						>
							<div className="space-y-5">
								<div className="flex items-start justify-between gap-3">
									<div>
										<p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Rank #{index + 1}</p>
										<h4 className="mt-1 font-display text-lg font-bold text-slate-100 tracking-tight">{match.career}</h4>
									</div>
									<span className={`rounded-xl border px-3 py-1 font-mono text-sm font-bold ${
										isTarget 
											? "border-cyan-600/40 bg-cyan-600/10 text-cyan-800"
											: "border-slate-700/25 bg-white text-slate-200"
									}`}>
										{match.score}%
									</span>
								</div>

								<div>
									<div className="mb-2 flex justify-between text-xs text-slate-400">
										<span className="font-semibold uppercase tracking-wider text-[10px]">Alignment</span>
										<span className="font-mono font-semibold">{match.score}%</span>
									</div>
									<ProgressBar value={match.score} />
								</div>

								<div className="space-y-4">
									<div>
										<p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Required Skills</p>
										<div className="mt-2 flex flex-wrap gap-1.5">
											{(match.requiredSkills || match.matchedSkills || []).slice(0, 5).map(skill => (
												<Badge key={skill} tone="slate">{skill}</Badge>
											))}
										</div>
									</div>
									<div>
										<p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Missing Skills</p>
										<div className="mt-2 flex flex-wrap gap-1.5">
											{match.missingSkills?.length > 0 ? match.missingSkills.slice(0, 4).map(skill => (
												<Badge key={skill} tone="rose">{skill}</Badge>
											)) : (
												<span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
													<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
													</svg>
													Fully aligned
												</span>
											)}
										</div>
									</div>
								</div>
							</div>

							<div className="mt-6 space-y-3">
								<div className="rounded-2xl border border-amber-600/20 bg-amber-600/5 px-4 py-2.5 flex items-center justify-between text-xs text-amber-800 font-medium">
									<span>Estimated effort:</span>
									<span className="font-mono bg-amber-600/10 px-2 py-0.5 rounded-lg border border-amber-600/20">~{match.estimatedWeeks || 4} weeks</span>
								</div>

								{isTarget ? (
								<div className="rounded-2xl border border-cyan-600/25 bg-cyan-600/10 px-4 py-2.5 text-center text-xs font-semibold text-cyan-800">
									Selected target career
								</div>
								) : null}
							</div>
						</article>
					);
				}) : (
					<div className="rounded-3xl border border-dashed border-slate-700/30 bg-white/60 p-8 text-center text-sm text-slate-500 lg:col-span-3">
						No career matches available yet. Complete your assessment to generate ranked careers.
					</div>
				)}
			</div>
		</SectionCard>
	);
}
