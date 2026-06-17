import { generateMentorInsights } from "./aiProvider";

export async function buildMentorInsights(analysis = {}) {
    // Attempt AI generation first; fallback to static logic on error.
    try {
        const aiResult = await generateMentorInsights(analysis);
        if (aiResult && aiResult.paragraphs && aiResult.highlight) {
            return aiResult;
        }
    } catch (e) {
        console.warn("AI mentor insights failed, using static fallback:", e);
    }

    // ---- Static fallback (original logic) ----
    const profile = analysis.profile || {};
    const readiness = analysis.readiness || {};
    const skillGap = analysis.skillGap || {};
    const topMatch = analysis.careerMatches?.[0];
    const targetCareer = topMatch?.career || profile.goal || "your target role";
    const topGaps = skillGap.prioritySkills?.length
        ? skillGap.prioritySkills.slice(0, 3)
        : skillGap.missingSkills?.slice(0, 3) || [];
    const gapText = topGaps.length > 0 ? topGaps.join(", ") : "foundational role skills";
    const weeks = Math.max(4, Math.ceil((skillGap.missingSkills?.length || 3) * 2));
    const strengthText =
        readiness.strengths?.length > 0
            ? readiness.strengths.slice(0, 3).join(", ")
            : "core academic foundations";

    const paragraphs = [
        `Based on your profile, ${targetCareer} is your strongest career match${topMatch ? ` at ${topMatch.score}% alignment` : ""}.`,
        `You already have strong foundations in ${strengthText}. Your current readiness score is ${readiness.score ?? 0}% (${readiness.label || "evaluating"}).`,
        `Your largest gaps are ${gapText}. Focus on these skills during the next ${weeks} weeks to improve your readiness score and move closer to interview readiness.`,
        readiness.summary || "Keep building projects and documenting your progress each week."
    ];

    return {
        paragraphs,
        highlight: {
            topCareer: targetCareer,
            readinessScore: readiness.score ?? 0,
            topGaps,
            estimatedWeeks: weeks
        }
    };
}
