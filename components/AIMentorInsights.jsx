import { buildMentorInsights } from "../lib/mentorInsights";
import SectionCard from "./ui/SectionCard";
import Badge from "./ui/Badge";

export default function AIMentorInsights({ analysis }) {
	if (!analysis) return null;

	const mentor = buildMentorInsights(analysis);

	return (
		<SectionCard
			eyebrow="AI Mentor Insights"
			title="Your personal career mentor"
			description="Natural language guidance generated from your profile, skills, and career matches."
		>
			<div className="mt-6 rounded-[28px] border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 via-blue-500/5 to-transparent p-6">
				<div className="flex items-start gap-4">
					<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-lg font-bold text-slate-950">
						AI
					</div>
					<div className="space-y-4">
						{mentor.paragraphs.map((paragraph, index) => (
							<p key={index} className="text-sm leading-7 text-slate-200 animate-fade-in">
								{paragraph}
							</p>
						))}
					</div>
				</div>
				<div className="mt-6 flex flex-wrap gap-2">
					<Badge tone="cyan">Top match: {mentor.highlight.topCareer}</Badge>
					<Badge tone="emerald">Readiness: {mentor.highlight.readinessScore}%</Badge>
					<Badge tone="amber">Focus: {mentor.highlight.estimatedWeeks} weeks</Badge>
				</div>
			</div>
		</SectionCard>
	);
}
