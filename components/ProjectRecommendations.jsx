import Badge from "./ui/Badge";
import SectionCard from "./ui/SectionCard";

const tierConfig = {
	beginner: { tone: "emerald", label: "Beginner", labelClass: "text-emerald-200" },
	intermediate: { tone: "sky", label: "Intermediate", labelClass: "text-sky-200" },
	advanced: { tone: "amber", label: "Advanced", labelClass: "text-amber-200" }
};

export default function ProjectRecommendations({ careerGoal = "AI Engineer", projects = {} }) {
	if (!projects) return null;

	const tiers = ["beginner", "intermediate", "advanced"];

	return (
		<SectionCard
			eyebrow="Recommended projects"
			title={`Project ideas for ${careerGoal}`}
			description="Build confidence step by step with projects at every difficulty level."
		>
			<div className="mt-6 grid gap-4 lg:grid-cols-3">
				{tiers.map(tierKey => {
					const config = tierConfig[tierKey];
					const project = projects[tierKey];

					if (!project) {
						return (
							<article key={tierKey} className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-5 text-sm text-slate-400">
								<p className={`text-xs font-semibold uppercase tracking-[0.22em] ${config.labelClass}`}>{config.label}</p>
								<p className="mt-3">No {config.label.toLowerCase()} project available.</p>
							</article>
						);
					}

					return (
						<article
							key={tierKey}
							className="rounded-3xl border border-white/10 bg-white/5 p-5 transition duration-200 hover:-translate-y-1 hover:border-cyan-400/20 hover:shadow-[0_18px_40px_rgba(8,145,178,0.12)]"
						>
							<div className="flex items-center justify-between gap-3">
								<Badge tone={config.tone}>{project.difficulty || config.label}</Badge>
								<span className="text-xs text-slate-400">{project.duration || "TBD"}</span>
							</div>

							<h4 className="mt-4 text-lg font-semibold text-white">{project.title}</h4>
							<p className="mt-2 text-sm leading-6 text-slate-300">{project.description}</p>

							<div className="mt-4">
								<p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Skills learned</p>
								<div className="mt-2 flex flex-wrap gap-2">
									{project.skills.map(skill => (
										<Badge key={skill} tone="slate">{skill}</Badge>
									))}
								</div>
							</div>
						</article>
					);
				})}
			</div>
		</SectionCard>
	);
}
