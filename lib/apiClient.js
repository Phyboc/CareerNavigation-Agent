/**
 * Small fetch wrapper used by client components. Adds a timeout (AbortController)
 * and normalizes error handling so the UI can never hang on a stalled request.
 * @param {string} url – Endpoint to call.
 * @param {object} [options] – fetch options plus `timeoutMs` (default 15s).
 * @returns {Promise<any>} Parsed JSON body of a successful response.
 */
export async function fetchJson(url, { method = "GET", headers = {}, body, timeoutMs = 15000 } = {}) {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), timeoutMs);

	try {
		const response = await fetch(url, { method, headers, body, signal: controller.signal });
		const payload = await response.json().catch(() => ({}));
		if (!response.ok) {
			throw new Error(payload?.error || `Request failed (${response.status})`);
		}
		return payload;
	} catch (error) {
		if (error && error.name === "AbortError") {
			throw new Error("Request timed out. Please try again.");
		}
		throw error;
	} finally {
		clearTimeout(timeout);
	}
}
