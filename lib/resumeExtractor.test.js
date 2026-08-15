import { describe, it, expect } from "vitest";

import { extractResumeSections, dedupeProjects, projectTitle } from "./resumeExtractor";

describe("extractResumeSections", () => {
	it("extracts the candidate name from the preamble", () => {
		const result = extractResumeSections(`
Rahul Sharma
rahul.sharma@example.com | +91 98765 43210
Bengaluru

PROJECTS
- Resume parser (Python)
- Chat app (React)
`);
		expect(result.name).toBe("Rahul Sharma");
	});

	it("captures bullet-style projects under a Projects heading", () => {
		const result = extractResumeSections(`
PROJECTS
- Resume parser built with Python and FastAPI
- Chat app using React and Node.js
`);
		expect(result.projects).toHaveLength(2);
		expect(result.projects[0].title).toContain("Resume parser");
	});

	it("captures inline heading lists (Projects: X, Y)", () => {
		const result = extractResumeSections(`
PROJECTS: Resume Parser, Chat App
EDUCATION
B.Tech CSE, IIT Madras
`);
		expect(result.projects.map(p => p.title)).toEqual(["Resume Parser", "Chat App"]);
		expect(result.education).toEqual(["B.Tech CSE, IIT Madras"]);
	});

	it("does not treat the heading itself as content (PROJECTS → no 'S' project)", () => {
		const result = extractResumeSections(`
PROJECTS
- Image classifier
`);
		const titles = result.projects.map(p => p.title);
		expect(titles).toEqual(["Image classifier"]);
		expect(titles.join(" ").toUpperCase()).not.toContain("PROJECTS");
		expect(titles.some(title => title === "S")).toBe(false);
	});

	it("captures certifications and ignores contact/summary lines", () => {
		const result = extractResumeSections(`
SUMMARY
A passionate developer.
CERTIFICATIONS
- AWS Certified Cloud Practitioner
- Google Data Analytics
`);
		expect(result.certifications).toContain("AWS Certified Cloud Practitioner");
		expect(result.certifications).toContain("Google Data Analytics");
	});

	it("handles numbered project lists", () => {
		const result = extractResumeSections(`
PROJECTS
1. Inventory management system
2. Sales dashboard
`);
		expect(result.projects).toHaveLength(2);
	});
});

describe("dedupeProjects", () => {
	it("fuzzy-dedupes the same project in different forms, keeping the description", () => {
		const deduped = dedupeProjects([
			"Resume Parser",
			{ title: "Resume Parser", description: "A tool that extracts structured data from resumes" }
		]);
		expect(deduped).toHaveLength(1);
		expect(deduped[0].title).toBe("Resume Parser");
		expect(deduped[0].description).toBe("A tool that extracts structured data from resumes");
	});

	it("keeps distinct projects separate", () => {
		const deduped = dedupeProjects(["Chat App", "Inventory System"]);
		expect(deduped).toHaveLength(2);
	});

	it("splits 'Title: description' and 'Title - description' strings", () => {
		const [a, b] = dedupeProjects(["Resume Parser: parses PDFs", "Chat App - realtime messaging"]);
		expect(a).toEqual({ title: "Resume Parser", description: "parses PDFs" });
		expect(b).toEqual({ title: "Chat App", description: "realtime messaging" });
	});

	it("drops empty titles", () => {
		expect(dedupeProjects(["", "  ", { title: "  ", description: "x" }])).toEqual([]);
	});
});

describe("projectTitle", () => {
	it("returns the title for strings and objects", () => {
		expect(projectTitle("Resume Parser")).toBe("Resume Parser");
		expect(projectTitle({ title: "Chat App", description: "d" })).toBe("Chat App");
		expect(projectTitle({ name: "Alt Name", description: "d" })).toBe("Alt Name");
	});
});
