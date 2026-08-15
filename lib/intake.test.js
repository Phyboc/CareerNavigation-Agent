import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import {
	nextMissingField,
	cannedQuestion,
	normalizeProfile,
	isComplete,
	handleIntakeTurn,
	INTAKE_ORDER
} from "./intake";

const fetchMock = vi.fn();

function jsonResponse(body) {
	return new Response(JSON.stringify(body), {
		status: 200,
		headers: { "Content-Type": "application/json" }
	});
}

function llmContent(content) {
	return jsonResponse({ choices: [{ message: { content } }] });
}

beforeEach(() => {
	vi.stubGlobal("fetch", fetchMock);
	process.env.GROQ_API_KEY = "test-key";
});

afterEach(() => {
	fetchMock.mockReset();
	vi.unstubAllGlobals();
	delete process.env.GROQ_API_KEY;
});

const FULL_PROFILE = {
	name: "Rahul Sharma",
	degree: "B.Tech CSE",
	goal: "AI Engineer",
	skills: "Python, SQL",
	projects: "Resume parser",
	hoursPerDay: "3"
};

describe("nextMissingField", () => {
	it("starts with the first field on an empty profile", () => {
		expect(nextMissingField({})).toBe("name");
	});

	it("returns the next missing field in order", () => {
		expect(nextMissingField({ name: "A" })).toBe("goal");
		expect(nextMissingField({ name: "A", goal: "AI Engineer" })).toBe("degree");
	});

	it("returns null when the profile is complete", () => {
		expect(nextMissingField(FULL_PROFILE)).toBeNull();
	});

	it("treats invalid hours as missing", () => {
		expect(nextMissingField({ ...FULL_PROFILE, hoursPerDay: "lots" })).toBe("hoursPerDay");
	});

	it("treats an unknown goal as missing", () => {
		expect(nextMissingField({ ...FULL_PROFILE, goal: "Astronaut" })).toBe("goal");
	});
});

describe("cannedQuestion", () => {
	it("returns a question for every intake field", () => {
		for (const field of INTAKE_ORDER) {
			expect(cannedQuestion(field)).toBeTruthy();
		}
	});
});

describe("normalizeProfile", () => {
	it("joins array skills/projects and drops empties", () => {
		expect(
			normalizeProfile({ name: "A", skills: ["Python", "SQL"], projects: [], hoursPerDay: 3 })
		).toEqual({ name: "A", skills: "Python, SQL", hoursPerDay: "3" });
	});
});

describe("isComplete", () => {
	it("accepts a full valid profile", () => {
		expect(isComplete(FULL_PROFILE)).toBe(true);
	});

	it("rejects missing fields", () => {
		expect(isComplete({ ...FULL_PROFILE, projects: "" })).toBe(false);
	});

	it("rejects out-of-range hours", () => {
		expect(isComplete({ ...FULL_PROFILE, hoursPerDay: "20" })).toBe(false);
	});

	it("rejects goals outside the career map", () => {
		expect(isComplete({ ...FULL_PROFILE, goal: "Astronaut" })).toBe(false);
	});
});

describe("handleIntakeTurn", () => {
	it("returns done immediately when the profile is already complete", async () => {
		const result = await handleIntakeTurn([{ role: "user", content: "3 hours" }], FULL_PROFILE);
		expect(result.done).toBe(true);
		expect(result.profile).toEqual(FULL_PROFILE);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("merges the model-extracted field and uses the model's question", async () => {
		fetchMock.mockResolvedValue(
			llmContent(JSON.stringify({ question: "Which career are you aiming for?", profile: { name: "Rahul Sharma" } }))
		);
		const result = await handleIntakeTurn([{ role: "user", content: "Rahul Sharma" }], {});
		expect(result.profile.name).toBe("Rahul Sharma");
		expect(result.reply).toContain("career");
		expect(result.done).toBe(false);
	});

	it("falls back to a canned question when the model returns prose", async () => {
		fetchMock.mockResolvedValue(llmContent("Sure, tell me more about yourself!"));
		const result = await handleIntakeTurn([{ role: "user", content: "Rahul Sharma" }], {});
		expect(result.reply).toBe(cannedQuestion("name"));
		expect(result.profile).toEqual({});
		expect(result.done).toBe(false);
	});

	it("re-asks when the model returns a goal outside the career map", async () => {
		fetchMock.mockResolvedValue(llmContent(JSON.stringify({ question: "next?", profile: { goal: "Astronaut" } })));
		const result = await handleIntakeTurn([{ role: "user", content: "Astronaut" }], { name: "Rahul" });
		expect(result.done).toBe(false);
		expect(result.reply).toContain("isn't on the list");
		expect(result.profile.goal).toBeUndefined();
	});

	it("re-asks when hours are not a valid number", async () => {
		fetchMock.mockResolvedValue(llmContent(JSON.stringify({ question: "hours?", profile: { hoursPerDay: "lots" } })));
		const result = await handleIntakeTurn(
			[{ role: "user", content: "as much as I can" }],
			{ name: "A", degree: "X", goal: "AI Engineer", skills: "Python", projects: "P" }
		);
		expect(result.done).toBe(false);
		expect(result.reply).toContain("number of hours");
		expect(result.profile.hoursPerDay).toBeUndefined();
	});

	it("marks the turn done once every field is present", async () => {
		fetchMock.mockResolvedValue(llmContent(JSON.stringify({ question: "done", profile: {} })));
		const result = await handleIntakeTurn([{ role: "user", content: "3 hours" }], FULL_PROFILE);
		expect(result.done).toBe(true);
	});
});
