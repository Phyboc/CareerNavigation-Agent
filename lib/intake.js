/**
 * Server-side conversational intake. The agent collects the student's profile
 * one field at a time (name → goal → degree → skills → projects → hours).
 * State is stateless: the client sends the current `profile` with every turn,
 * the model extracts the latest answer, and the merged profile comes back.
 * Any model failure degrades to canned questions, so the flow never stalls.
 */

import { callLLM } from "./aiProvider";
import { careerPaths } from "./careerPaths";

export const INTAKE_ORDER = ["name", "goal", "degree", "skills", "projects", "hoursPerDay"];

export const INTAKE_QUESTIONS = {
	name: "Great, let's start. What's your full name?",
	goal: `Which career are you aiming for? Choose one: ${Object.keys(careerPaths).join(", ")}.`,
	degree: "What's your degree or education background? (e.g. B.Tech CSE)",
	skills: "What skills do you currently have? List them comma-separated.",
	projects: "Which projects have you built? List them comma-separated.",
	hoursPerDay: "How many hours can you study per day? (a number between 1 and 12)"
};

function hasValue(value) {
	return value !== undefined && value !== null && String(value).trim() !== "";
}

function validHours(value) {
	const number = Number(value);
	return Number.isFinite(number) && number >= 1 && number <= 12;
}

/**
 * First field in the fixed order that is still missing or invalid.
 * @param {object} [profile] – Current known profile.
 * @returns {string|null} Field name, or null when the profile is complete.
 */
export function nextMissingField(profile = {}) {
	return INTAKE_ORDER.find(field => {
		if (!hasValue(profile[field])) return true;
		if (field === "hoursPerDay" && !validHours(profile[field])) return true;
		if (field === "goal" && !careerPaths[profile[field]]) return true;
		return false;
	}) || null;
}

/**
 * Deterministic fallback question for a field (used when the model is
 * unavailable or returns unusable output).
 * @param {string} field
 * @returns {string}
 */
export function cannedQuestion(field) {
	return INTAKE_QUESTIONS[field] || "Tell me a bit more about yourself.";
}

/**
 * Coerce a raw profile into the canonical shape: skills/projects become
 * comma-separated strings, everything else a trimmed string. Drops empties.
 * @param {object} [profile]
 * @returns {object}
 */
export function normalizeProfile(profile = {}) {
	const next = {};
	for (const field of INTAKE_ORDER) {
		if (field === "skills" || field === "projects") {
			if (Array.isArray(profile[field])) {
				const joined = profile[field].map(String).join(", ").trim();
				if (joined) next[field] = joined;
			} else if (hasValue(profile[field])) {
				next[field] = String(profile[field]).trim();
			}
		} else if (hasValue(profile[field])) {
			next[field] = String(profile[field]).trim();
		}
	}
	return next;
}

/**
 * @param {object} [profile]
 * @returns {boolean} True when every field is present and valid.
 */
export function isComplete(profile = {}) {
	return INTAKE_ORDER.every(field => {
		if (!hasValue(profile[field])) return false;
		if (field === "hoursPerDay" && !validHours(profile[field])) return false;
		if (field === "goal" && !careerPaths[profile[field]]) return false;
		return true;
	});
}

/**
 * One turn of the intake conversation.
 * @param {Array<{role: string, content: string}>} [messages] – Conversation so far.
 * @param {object} [currentProfile] – Known profile fields (sent by the client).
 * @returns {Promise<{ reply: string, profile: object, done: boolean }>}
 */
export async function handleIntakeTurn(messages = [], currentProfile = {}) {
	const missing = nextMissingField(currentProfile);
	if (!missing) {
		return { reply: "Your profile is ready!", profile: currentProfile, done: true };
	}

	const system = `You are an intake assistant for a career-guidance app. You collect a student's profile one field at a time.
Fields (in this order): name, goal, degree, skills, projects, hoursPerDay.
Allowed goals: ${Object.keys(careerPaths).join(", ")}.
Known so far: ${JSON.stringify(normalizeProfile(currentProfile))}.
The next field to collect is "${missing}".
Read the user's last message and extract the value for "${missing}" if they provided it (skills/projects are comma-separated lists; hoursPerDay is a number from 1 to 12).
Reply with ONLY valid JSON and no prose, shaped exactly like:
{"question": "a short, friendly follow-up question for the user", "profile": {"<field>": "<extracted value>"}}
In "profile" include only fields the user has actually provided; never guess values.
If the last message did not answer "${missing}", put a question for "${missing}" in "question" and an empty profile {}.`;

	try {
		const raw = await callLLM("", "", {
			messages: [
				{ role: "system", content: system },
				...messages.slice(-8)
			],
			temperature: 0.3,
			maxTokens: 200
		});

		if (raw && typeof raw === "object" && !Array.isArray(raw)) {
			let merged = normalizeProfile({ ...currentProfile, ...(raw.profile || {}) });
			const modelQuestion = typeof raw.question === "string" ? raw.question.trim() : "";

			// Never accept a goal outside the known career map.
			if (merged.goal && !careerPaths[merged.goal]) {
				delete merged.goal;
				return {
					reply: `That goal isn't on the list yet. Choose one of: ${Object.keys(careerPaths).join(", ")}.`,
					profile: merged,
					done: false
				};
			}
			// Hours must be numeric within 1-12.
			if (merged.hoursPerDay && !validHours(merged.hoursPerDay)) {
				delete merged.hoursPerDay;
				return {
					reply: "That doesn't look like a number of hours. How many hours per day can you study? (1-12)",
					profile: merged,
					done: false
				};
			}

			const done = isComplete(merged);
			return {
				reply: done ? "Your profile is ready!" : modelQuestion || cannedQuestion(nextMissingField(merged)),
				profile: merged,
				done
			};
		}
	} catch {
		// Model unavailable – fall through to the canned question.
	}

	return {
		reply: cannedQuestion(missing),
		profile: normalizeProfile(currentProfile),
		done: false
	};
}
