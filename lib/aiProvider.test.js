import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { callLLM, extractJson, toCamelKeys, generateResumeAnalysis, groqStreamToText } from "./aiProvider";

const BASE_URL = "https://api.groq.com/openai/v1/chat/completions";
const fetchMock = vi.fn();

function jsonResponse(body, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" }
	});
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

describe("extractJson", () => {
	it("parses fenced JSON", () => {
		expect(extractJson('```json\n{"a": 1}\n```')).toEqual({ a: 1 });
	});

	it("parses plain JSON", () => {
		expect(extractJson('{"a": 1}')).toEqual({ a: 1 });
	});

	it("extracts the first JSON object embedded in prose", () => {
		expect(extractJson('Here you go: {"skills": ["a", "b"]} thanks')).toEqual({ skills: ["a", "b"] });
	});

	it("returns the raw string when no JSON is present", () => {
		expect(extractJson("just conversational prose")).toBe("just conversational prose");
	});

	it("returns non-string input untouched", () => {
		expect(extractJson(null)).toBe(null);
		expect(extractJson(42)).toBe(42);
	});
});

describe("toCamelKeys", () => {
	it("recursively converts snake_case keys to camelCase", () => {
		expect(
			toCamelKeys({
				match_score: 80,
				career_fit: "Strong fit",
				nested: { detected_skills: ["Python"] },
				list: [{ project_title: "Chat App" }],
				plain: "keep"
			})
		).toEqual({
			matchScore: 80,
			careerFit: "Strong fit",
			nested: { detectedSkills: ["Python"] },
			list: [{ projectTitle: "Chat App" }],
			plain: "keep"
		});
	});
});

describe("callLLM", () => {
	it("returns raw text when the raw option is set", async () => {
		fetchMock.mockResolvedValue(jsonResponse({ choices: [{ message: { content: "Hello mentor" } }] }));
		const result = await callLLM("sys", "user", { raw: true });
		expect(result).toBe("Hello mentor");
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it("parses JSON when raw is not set", async () => {
		fetchMock.mockResolvedValue(jsonResponse({ choices: [{ message: { content: '{"ok": true}' } }] }));
		const result = await callLLM("sys", "user");
		expect(result).toEqual({ ok: true });
	});

	it("builds the expected Groq payload", async () => {
		fetchMock.mockResolvedValue(jsonResponse({ choices: [{ message: { content: "ok" } }] }));
		await callLLM("sys prompt", "user prompt", { raw: true, maxTokens: 123, model: "test-model" });

		const [url, options] = fetchMock.mock.calls[0];
		expect(url).toBe(BASE_URL);
		expect(options.headers.Authorization).toBe("Bearer test-key");
		const body = JSON.parse(options.body);
		expect(body.model).toBe("test-model");
		expect(body.max_tokens).toBe(123);
		expect(body.messages).toEqual([
			{ role: "system", content: "sys prompt" },
			{ role: "user", content: "user prompt" }
		]);
	});

	it("passes a full conversation through when messages are provided", async () => {
		fetchMock.mockResolvedValue(jsonResponse({ choices: [{ message: { content: "ok" } }] }));
		const messages = [
			{ role: "user", content: "hi" },
			{ role: "assistant", content: "hello" }
		];
		await callLLM("", "", { messages, raw: true });
		const body = JSON.parse(fetchMock.mock.calls[0][1].body);
		expect(body.messages).toEqual(messages);
	});

	it("throws when GROQ_API_KEY is missing", async () => {
		delete process.env.GROQ_API_KEY;
		await expect(callLLM("sys", "user")).rejects.toThrow(/GROQ_API_KEY/);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("times out with a clear error", async () => {
		fetchMock.mockImplementation((_url, options) =>
			new Promise((_resolve, reject) => {
				options.signal.addEventListener("abort", () => {
					const error = new Error("aborted");
					error.name = "AbortError";
					reject(error);
				});
			})
		);
		await expect(callLLM("sys", "user", { timeoutMs: 50 })).rejects.toThrow(/timed out after 50ms/);
	});

	it("retries once on a transient 5xx", async () => {
		fetchMock
			.mockResolvedValueOnce(new Response("boom", { status: 500 }))
			.mockResolvedValueOnce(jsonResponse({ choices: [{ message: { content: "retried ok" } }] }));
		const result = await callLLM("sys", "user", { raw: true });
		expect(result).toBe("retried ok");
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});
});

describe("generateResumeAnalysis", () => {
	it("normalizes model output into safe, app-shaped values", async () => {
		fetchMock.mockResolvedValue(
			jsonResponse({
				choices: [
					{
						message: {
							content: JSON.stringify({
								detected_skills: [
									"Python",
									"A sentence that is far too long to ever be a real skill name for filtering purposes",
									"ML"
								],
								strengths: ["Strong fundamentals"],
								recommendations: ["Add impact metrics"],
								name: "Rahul Sharma",
								projects: [{ title: "Resume Parser", description: "Parses resumes" }],
								education: [{ degree: "B.Tech", institution: "IIT", gpa: 8.5 }],
								certifications: [{ name: "AWS", issuer: "Amazon" }],
								match_score: 0.85,
								career_fit: "excellent fit"
							})
						}
					}
				]
			})
		);

		const result = await generateResumeAnalysis("resume text", "AI Engineer", ["Python", "ML"]);
		expect(result.detectedSkills).toEqual(["Python", "ML"]);
		expect(result.strengths).toEqual(["Strong fundamentals"]);
		expect(result.suggestions).toEqual(["Add impact metrics"]);
		expect(result.education).toEqual(["B.Tech, IIT, GPA: 8.5"]);
		expect(result.certifications).toEqual(["AWS — Amazon"]);
		expect(result.projects).toEqual([{ title: "Resume Parser", description: "Parses resumes" }]);
		expect(result.matchScore).toBe(85);
		expect(result.careerFit).toBe("Strong fit");
		expect(result.name).toBe("Rahul Sharma");
		expect(result.targetCareer).toBe("AI Engineer");
	});

	it("coerces arrays and defaults when the model returns partial output", async () => {
		fetchMock.mockResolvedValue(
			jsonResponse({
				choices: [{ message: { content: JSON.stringify({ name: "Only Name" }) } }]
			})
		);
		const result = await generateResumeAnalysis("resume text", "Data Scientist", []);
		expect(result.name).toBe("Only Name");
		expect(result.detectedSkills).toEqual([]);
		expect(result.education).toEqual([]);
		expect(result.certifications).toEqual([]);
		expect(result.projects).toEqual([]);
		expect(result.matchScore).toBe(0);
	});
});

describe("groqStreamToText", () => {
	async function collect(stream) {
		const reader = stream.getReader();
		let text = "";
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			text += new TextDecoder().decode(value);
		}
		return text;
	}

	function sseStream(chunks) {
		const encoder = new TextEncoder();
		return new ReadableStream({
			start(controller) {
				for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
				controller.close();
			}
		});
	}

	it("extracts delta content and ignores [DONE] and event lines", async () => {
		const stream = groqStreamToText(
			sseStream([
				'data: {"choices":[{"delta":{"content":"Hello"}}]}\n',
				'data: {"choices":[{"delta":{"content":" world"}}]}\n\n',
				"event: done\ndata: [DONE]\n"
			])
		);
		expect(await collect(stream)).toBe("Hello world");
	});

	it("buffers JSON lines split across network chunks", async () => {
		const stream = groqStreamToText(
			sseStream(['data: {"choices":[{"delta":{"conte', 'nt":"Hi"}}]}\ndata: [DONE]\n'])
		);
		expect(await collect(stream)).toBe("Hi");
	});

	it("skips malformed data lines without breaking the stream", async () => {
		const stream = groqStreamToText(
			sseStream(['data: not-json\n', 'data: {"choices":[{"delta":{"content":"ok"}}]}\n'])
		);
		expect(await collect(stream)).toBe("ok");
	});
});

describe("daily-quota fast-fail", () => {
	it("caches a TPD 429 so subsequent calls skip the network", async () => {
		// Fresh module so the module-level quota flag starts unset regardless of
		// test order in this file (must stay last).
		vi.resetModules();
		const fresh = await import("./aiProvider");
		const { callLLM: freshCallLLM } = fresh;

		fetchMock
			.mockResolvedValueOnce(new Response("You have exceeded your tokens per day (TPD) limit", { status: 429 }))
			.mockResolvedValueOnce(jsonResponse({ choices: [{ message: { content: "should not be reached" } }] }));

		await expect(freshCallLLM("sys", "user")).rejects.toThrow(/429/);
		await expect(freshCallLLM("sys", "user")).rejects.toThrow(/quota reached/i);
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});
});
