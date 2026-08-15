import { describe, it, expect } from "vitest";

import { buildChatFallback } from "./chatFallback";

const analysis = {
	profile: { name: "Rahul", degree: "B.Tech CSE", goal: "AI Engineer", skills: ["Python", "SQL"] },
	readiness: { score: 49, label: "Early stage", strengths: ["Python", "Git"], weaknesses: [] },
	skillGap: { missingSkills: ["Deep Learning"], prioritySkills: ["Machine Learning", "Deep Learning"] },
	careerMatches: [
		{ career: "AI Engineer", score: 62 },
		{ career: "Data Scientist", score: 55 }
	],
	roadmap: [
		{ phase: "Phase 1", title: "Close your skill gaps", items: ["Learn: Deep Learning", "Practice: Deep Learning"] }
	],
	weeklySchedule: [{ day: "Monday", focus: "Learn: Deep Learning", hours: 2 }],
	nextStep: {
		title: "Close your top gap: Machine Learning",
		description: "Focus here first.",
		href: "/roadmap"
	},
	resumeAnalysis: { matchScore: 74, careerFit: "Strong fit", suggestions: ["Add impact metrics"] }
};	describe("buildChatFallback", () => {
		it("handles a missing analysis without crashing (regression)", () => {
			expect(() => buildChatFallback("career", null, [{ role: "user", content: "hi" }])).not.toThrow();
			expect(() => buildChatFallback("career", undefined, [])).not.toThrow();
			const reply = buildChatFallback("career", null, []);
			expect(reply).toContain("/assessment");
		});

		it("points a user without a profile to the assessment", () => {
			const reply = buildChatFallback("career", {}, []);
			expect(reply).toContain("/assessment");
			expect(reply).toContain("profile");
		});

	it("summarizes readiness, top match, and next step for the career agent", () => {
		const reply = buildChatFallback("career", analysis, [{ role: "user", content: "where do I stand?" }]);
		expect(reply).toContain("49%");
		expect(reply).toContain("AI Engineer");
		expect(reply).toContain("Machine Learning");
		expect(reply).toContain("/roadmap");
		expect(reply).toContain("Python");
	});

	it("reviews the resume for the resume agent", () => {
		const reply = buildChatFallback("resume", analysis, []);
		expect(reply).toContain("74%");
		expect(reply).toContain("Add impact metrics");
	});

	it("suggests the resume analyzer when no resume analysis exists", () => {
		const reply = buildChatFallback("resume", { ...analysis, resumeAnalysis: {} }, []);
		expect(reply).toContain("/resume");
	});

	it("builds a study plan for the study agent", () => {
		const reply = buildChatFallback("study", analysis, []);
		expect(reply).toContain("Close your skill gaps");
		expect(reply).toContain("Monday");
		expect(reply).toContain("/roadmap");
	});

	it("detects resume intent from the user message when the agent is generic", () => {
		const reply = buildChatFallback("career", analysis, [{ role: "user", content: "Please review my resume" }]);
		expect(reply).toContain("74%");
	});
});
