import Badge from "./ui/Badge";
import ProgressBar from "./ui/ProgressBar";
import SectionCard from "./ui/SectionCard";

export default function CareerMatches({ matches = [], selectedCareer = "" }) {
	return (
		<SectionCard
			eyebrow="Career match ranking"
			title="Top 3 matching careers"
			description="Ranked by skill alignment with required skills, missing gaps, and estimated learning effort."
		>
			<div className="mt-6 grid gap-4 lg:grid-cols-3">
				{matches.length > 0 ? matches.map((match, index) => (
					<article
						key={match.career}
						className={`group rounded-3xl border p-5 transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(8,145,178,0.12)] ${
							match.career === selectedCareer
								? "border-cyan-400/30 bg-cyan-400/10"
								: "border-white/10 bg-white/5 hover:border-cyan-400/20"
						}`}
					>
						<div className="flex items-start justify-between gap-3">
							<div>
								<p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Rank #{index + 1}</p>
								<h4 className="mt-2 text-lg font-semibold text-white">{match.career}</h4>
							</div>
							<span className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-sm font-semibold text-slate-100">
								{match.score}%
							</span>
						</div>

						<div className="mt-4">
							<div className="mb-1 flex justify-between text-xs text-slate-400">
								<span>Match</span>
								<span>{match.score}%</span>
							</div>
							<ProgressBar value={match.score} />
						</div>

						<div className="mt-4 space-y-3">
							<div>
								<p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Required skills</p>
								<div className="mt-2 flex flex-wrap gap-1.5">
									{(match.requiredSkills || match.matchedSkills || []).slice(0, 5).map(skill => (
										<Badge key={skill} tone="slate">{skill}</Badge>
									))}
								</div>
							</div>
							<div>
								<p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Missing skills</p>
								<div className="mt-2 flex flex-wrap gap-1.5">
									{match.missingSkills?.length > 0 ? match.missingSkills.slice(0, 4).map(skill => (
										<Badge key={skill} tone="rose">{skill}</Badge>
									)) : (
										<span className="text-sm text-slate-400">None</span>
									)}
								</div>
							</div>
							<div className="rounded-2xl border border-amber-400/15 bg-amber-400/5 px-3 py-2">
								<p className="text-xs text-amber-200">
									Estimated effort: ~{match.estimatedWeeks || 4} weeks
								</p>
							</div>
						</div>

						{match.career === selectedCareer ? (
							<div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
								Selected target career
							</div>
						) : null}
					</article>
				)) : (
					<div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-5 text-sm text-slate-400 lg:col-span-3">
						No career matches available yet. Complete your assessment to generate ranked careers.
					</div>
				)}
			</div>
		</SectionCard>
	);
}
