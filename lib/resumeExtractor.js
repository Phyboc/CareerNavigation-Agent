/**
 * Deterministic, section-aware extraction of structured fields from raw resume
 * text (PDF or plain text). Returns name, projects (title + description),
 * education, and certifications. Deliberately heuristic – used to enrich the
 * AI analysis, not to replace it. Section headings drive the scan, so
 * bullet-style lists under a "Projects" heading are captured correctly.
 */

const HEADING_RE = /^(projects?|academic projects?|professional projects?|personal projects?|education|certifications?|certificates?|skills|technical skills|experience|work experience|internships?|summary|objective|achievements?|courses?|training|extracurriculars?)\s*:?$/i;
const INLINE_HEADING_RE = /^(projects?|education|certifications?|skills)\s*:?\s+(.+)$/i;
const CONTACT_RE = /@|https?:\/\/|linkedin|github|github\.com|^\+?\d[\d\s().-]{6,}$/i;
const BULLET_RE = /^[-•*·▪–—]\s*(.+)$/;
const NUMBERED_RE = /^\d+[.)]\s*(.+)$/;

function isHeading(line) {
	return line.length > 0 && line.length <= 30 && HEADING_RE.test(line);
}

function cleanList(items = []) {
	return [...new Set(items.map(item => String(item).trim()).filter(Boolean))];
}

function extractName(lines) {
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		// Explicit "Name: Rahul Sharma" format.
		if (/^name\s*:/i.test(line)) {
			return line.replace(/^name\s*:\s*/i, "").trim();
		}

		if (isHeading(line) || INLINE_HEADING_RE.test(line)) continue;
		if (CONTACT_RE.test(line)) continue;
		if (/^(resume|cv|curriculum vitae)$/i.test(line)) continue;

		if (line.length >= 2 && line.length <= 60) {
			const words = line.split(/\s+/).filter(Boolean);
			if (words.length >= 1 && words.length <= 4) {
				return line;
			}
		}
	}
	return "";
}

/**
 * Split "Title: description", "Title - description", or "Title – description"
 * into a structured project. Without a delimiter the whole line is treated as
 * the title and the description is left empty.
 * @param {string} value
 * @returns {{ title: string, description: string }}
 */
function splitProject(value) {
	const text = String(value || "").trim();
	const match = text.match(/^(.+?)\s*(?::\s*|\s+[-–—]\s+)(.+)$/);
	if (match) {
		return { title: match[1].trim(), description: match[2].trim() };
	}
	return { title: text, description: "" };
}

/**
 * Normalize a project entry that may be a plain string or an object
 * ({ title, name, description }).
 * @param {any} value
 * @returns {{ title: string, description: string }}
 */
function toProject(value) {
	if (value && typeof value === "object") {
		return {
			title: String(value.title || value.name || "").trim(),
			description: String(value.description || "").trim()
		};
	}
	return splitProject(value);
}

/**
 * Title of a project entry (string or { title, description }).
 * @param {any} value
 * @returns {string}
 */
export function projectTitle(value) {
	return toProject(value).title;
}

function normalizeProject(value) {
	return String(value)
		.toLowerCase()
		.replace(/\s+/g, " ")
		.replace(/[^a-z0-9\s]/g, "")
		.trim();
}

// Prefer the entry with a description; otherwise the longer title.
function betterProject(a, b) {
	const aHasDesc = a.description.length > 0;
	const bHasDesc = b.description.length > 0;
	if (aHasDesc !== bHasDesc) return aHasDesc ? a : b;
	return a.title.length >= b.title.length ? a : b;
}

/**
 * Fuzzy-dedupe projects so the same project listed in different forms (e.g.
 * the full bullet line from heuristics vs. the AI's short title + description)
 * appears only once. Returns structured { title, description } entries, keeping
 * the version with a description (falling back to the longest title).
 * @param {any[]} [items] – Raw project strings or { title, description } objects.
 * @returns {Array<{ title: string, description: string }>}
 */
export function dedupeProjects(items = []) {
	const result = [];

	for (const item of items) {
		const entry = toProject(item);
		if (!entry.title) continue;
		const norm = normalizeProject(entry.title);
		let placed = false;

		for (let i = 0; i < result.length; i++) {
			const existingNorm = normalizeProject(result[i].title);
			if (existingNorm === norm || existingNorm.includes(norm) || norm.includes(existingNorm)) {
				result[i] = betterProject(result[i], entry);
				placed = true;
				break;
			}
		}

		if (!placed) result.push(entry);
	}

	return result;
}

/**
 * @param {string} [text] – Raw resume text.
 * @returns {{ name: string, projects: Array<{ title: string, description: string }>, education: string[], certifications: string[] }}
 */
export function extractResumeSections(text = "") {
	const lines = String(text || "")
		.split(/\r?\n/)
		.map(line => line.trim())
		.filter(Boolean);

	const projects = [];
	const education = [];
	const certifications = [];
	let section = null;

	for (const line of lines) {
		if (isHeading(line)) {
			section = line.toLowerCase().replace(/^academic |^professional |^personal /, "").replace(/:$/, "");
			continue;
		}

		// "Projects: X, Y" style – heading and content on one line.
		const inline = line.match(INLINE_HEADING_RE);
		if (inline) {
			section = inline[1].toLowerCase();
			const content = inline[2].trim();
			if (section === "projects") {
				projects.push(...content.split(/[,;]| and /));
			} else if (section === "education") {
				education.push(content);
			} else if (section === "certifications") {
				certifications.push(content);
			}
			continue;
		}

		if (!section) continue; // preamble (name/contact) – not captured

		const bullet = line.match(BULLET_RE) || line.match(NUMBERED_RE);
		const content = bullet ? bullet[1].trim() : line;

		if (/^projects?/.test(section)) {
			if (content.includes(",") || content.includes(";")) {
				projects.push(...content.split(/[,;]| and /));
			} else {
				projects.push(content);
			}
		} else if (/^education/.test(section)) {
			education.push(content);
		} else if (/^certif/.test(section)) {
			certifications.push(content);
		}
	}

	return {
		name: extractName(lines),
		projects: dedupeProjects(projects),
		education: cleanList(education),
		certifications: cleanList(certifications)
	};
}
