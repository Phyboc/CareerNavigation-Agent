import { describe, it, expect } from "vitest";

import {
	buildAnalysis,
	analyzeResumeText,
	mergeResumeAnalysis,
	parseSkills,
	getRequiredSkills,
	buildCareerMatches,
	buildNextStep
} from "./analyzer";

describe("buildAnalysis", () => {
	it("produces the full deterministic analysis shape", () => {
		const analysis = buildAnalysis({
			name: "Test User",
			degree: "B.Tech CSE",
			skills: "Python, Git, SQL",
			projects: "Project A",
			goal: "AI Engineer",
			hoursPerDay: 2
		});

		expect(analysis.profile.name).toBe("Test User");
		expect(analysis.profile.skills).toEqual(["Python", "Git", "SQL"]);
		expect(analysis.readiness).toEqual({
			score: 38,
			label: "Early stage",
			// matched skills follow the required-skills order, not the input order
			strengths: ["Python", "SQL", "Git"],
			weaknesses: expect.arrayContaining(["Data Structures", "Machine Learning"]),
			summary: expect.any(String)
		});
		expect(analysis.skillGap.existingSkills).toEqual(["Python", "SQL", "Git"]);
		expect(analysis.skillGap.missingSkills).toEqual(
			expect.arrayContaining(["Machine Learning", "Deep Learning", "Cloud"])
		);
		expect(analysis.skillGap.prioritySkills).toHaveLength(5);
		expect(analysis.skillGap.prioritySkills).toContain("Machine Learning");
		expect(analysis.roadmap).toHaveLength(4);
		expect(analysis.weeklySchedule).toHaveLength(7);
		expect(analysis.careerMatches).toHaveLength(3);
		// Sorted by score descending; the selected goal is always present.
		expect(analysis.careerMatches[0].score).toBeGreaterThanOrEqual(analysis.careerMatches[1].score);
		expect(analysis.careerMatches.some(match => match.career === "AI Engineer" && match.selected)).toBe(true);
		expect(analysis.resources.courses.length).toBeGreaterThan(0);
		expect(analysis.projectRecommendations.beginner.title).toBeTruthy();
	});

	it("computes readiness score from skill match + project + consistency bonuses", () => {
		// 4/10 required skills matched = 0.4 * 80 = 32; +8 project; +9 consistency (3h * 3) = 49
		const analysis = buildAnalysis({
			name: "A",
			degree: "X",
			skills: "Python, Data Structures, Git, SQL",
			projects: "One project",
			goal: "AI Engineer",
			hoursPerDay: 3
		});
		expect(analysis.readiness.score).toBe(49);
	});

	it("never exceeds 100 even with every skill and high hours", () => {
		const analysis = buildAnalysis({
			name: "A",
			degree: "X",
			skills: getRequiredSkills("AI Engineer").join(", "),
			projects: "P1, P2, P3",
			goal: "AI Engineer",
			hoursPerDay: 12
		});
		expect(analysis.readiness.score).toBe(100);
	});
});

describe("analyzeResumeText", () => {
	it("matches multi-word skills across line breaks and collapsed whitespace", () => {
		const result = analyzeResumeText("Python\nMachine Learning\nData \nStructures", "AI Engineer");
		expect(result.detectedSkills).toContain("Data Structures");
		expect(result.detectedSkills).toContain("Machine Learning");
		expect(result.detectedSkills).toContain("Python");
	});

	it("reports the missing skills for the target career", () => {
		const result = analyzeResumeText("Python, Git", "AI Engineer");
		expect(result.missingSkills).toContain("Deep Learning");
		expect(result.missingSkills).not.toContain("Python");
		expect(result.missingSkills).not.toContain("Git");
		expect(result.targetCareer).toBe("AI Engineer");
	});

	it("maps score to a career fit label", () => {
		expect(analyzeResumeText(getRequiredSkills("AI Engineer").join(", "), "AI Engineer").careerFit).toBe("Strong fit");
		expect(analyzeResumeText("", "AI Engineer").careerFit).toBe("Needs development");
	});
});

describe("mergeResumeAnalysis", () => {
	it("unions static + AI skills and recomputes missing skills canonically", () => {
		const staticAnalysis = analyzeResumeText("Python, Git", "AI Engineer");
		const merged = mergeResumeAnalysis(staticAnalysis, {
			detectedSkills: ["Python", "TensorFlow"],
			strengths: ["Communication"],
			suggestions: ["Add impact metrics"]
		});

		expect(merged.detectedSkills).toEqual(expect.arrayContaining(["Python", "Git", "TensorFlow"]));
		expect(merged.missingSkills).toContain("Machine Learning");
		expect(merged.missingSkills).not.toContain("Python");
		expect(merged.matchScore).toBe(20);
		expect(merged.careerFit).toBe("Needs development");
		expect(merged.strengths).toContain("Communication");
		expect(merged.suggestions).toContain("Add impact metrics");
	});

	it("handles a null AI result by keeping the static analysis", () => {
		const staticAnalysis = analyzeResumeText("Python, Git", "AI Engineer");
		const merged = mergeResumeAnalysis(staticAnalysis, null);
		expect(merged.detectedSkills).toEqual(staticAnalysis.detectedSkills);
		expect(merged.matchScore).toBe(staticAnalysis.matchScore);
	});
});

describe("parseSkills", () => {
	it("canonicalizes aliases, dedupes, and drops empties", () => {
		expect(parseSkills("Python, JS, JavaScript, dsa, , SQL, mysql")).toEqual([
			"Python",
			"JavaScript",
			"Data Structures",
			"SQL"
		]);
	});
});

describe("expanded career map", () => {
	it("provides required skills for the new career paths", () => {
		expect(getRequiredSkills("Data Analyst")).toContain("Excel");
		expect(getRequiredSkills("DevOps Engineer")).toEqual(expect.arrayContaining(["Docker", "Kubernetes", "CI/CD"]));
		expect(getRequiredSkills("Cloud Engineer")).toContain("Kubernetes");
		expect(getRequiredSkills("Cybersecurity Analyst")).toContain("Networking");
	});

	it("builds a full analysis for a new career path", () => {
		const analysis = buildAnalysis({
			name: "A",
			degree: "X",
			skills: "Python, SQL, Statistics, Excel, Data Visualization",
			projects: "Sales dashboard",
			goal: "Data Analyst",
			hoursPerDay: 2
		});
		expect(analysis.profile.goal).toBe("Data Analyst");
		expect(analysis.roadmap).toHaveLength(4);
		expect(analysis.careerMatches[0].career).toBe("Data Analyst");
		expect(analysis.projectRecommendations.beginner.title).toBeTruthy();
	});

	it("keeps career matches sorted by score across the larger map", () => {
		const matches = buildCareerMatches(["Python", "SQL", "Git"], "Cloud Engineer");
		expect(matches).toHaveLength(3);
		expect(matches[0].score).toBeGreaterThanOrEqual(matches[1].score);
		expect(matches[1].score).toBeGreaterThanOrEqual(matches[2].score);
	});
});

describe("buildNextStep", () => {
	it("directs an empty profile to the assessment", () => {
		expect(buildAnalysis({}).nextStep.href).toBe("/assessment");
	});

	it("prioritizes closing the top skill gap", () => {
		const analysis = buildAnalysis({
			name: "A",
			degree: "X",
			skills: "Python",
			projects: "P",
			goal: "AI Engineer",
			hoursPerDay: 2
		});
		expect(analysis.nextStep.href).toBe("/roadmap");
		expect(analysis.nextStep.title).toContain("Machine Learning");
	});

	it("suggests a project once gaps are closed but no projects exist", () => {
		const analysis = buildAnalysis({
			name: "A",
			degree: "X",
			skills: getRequiredSkills("AI Engineer").join(", "),
			projects: "",
			goal: "AI Engineer",
			hoursPerDay: 2
		});
		expect(analysis.nextStep.href).toBe("/projects");
	});

	it("suggests the resume analyzer once a project exists", () => {
		const analysis = buildAnalysis({
			name: "A",
			degree: "X",
			skills: getRequiredSkills("AI Engineer").join(", "),
			projects: "P1",
			goal: "AI Engineer",
			hoursPerDay: 2
		});
		expect(analysis.nextStep.href).toBe("/resume");
	});

	it("pushes a ready user (all skills, project, resume) toward interviews", () => {
		const analysis = buildAnalysis({
			name: "A",
			degree: "X",
			skills: getRequiredSkills("AI Engineer").join(", "),
			projects: "P1",
			goal: "AI Engineer",
			hoursPerDay: 2
		});
		analysis.resumeAnalysis = { matchScore: 90 };
		expect(buildNextStep(analysis).href).toBe("/chat");
	});
});

describe("buildCareerMatches", () => {
	it("ranks careers by skill overlap and marks the selected goal", () => {
		const matches = buildCareerMatches(["Python", "SQL", "Git"], "Data Scientist");
		expect(matches).toHaveLength(3);
		expect(matches[0].career).toBe("Data Scientist");
		expect(matches[0].selected).toBe(true);
		expect(matches[0].score).toBeGreaterThan(0);
	});
});
