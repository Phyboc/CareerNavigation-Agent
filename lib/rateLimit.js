/**
 * Tiny in-memory sliding-window rate limiter for the API routes. Suitable for a
 * single-instance deployment; for multi-instance or production scale, swap in a
 * shared store (Redis/Upstash) that exposes the same `rateLimit` interface.
 */

const WINDOW_MS = 60_000;
const MAX_BUCKETS = 10_000;
const buckets = new Map();

/**
 * @param {string} key – Unique per client (e.g. IP + route).
 * @param {number} limit – Max requests allowed in the rolling window.
 * @returns {{ limited: boolean, retryAfter?: number, remaining?: number }}
 */
export function rateLimit(key, limit) {
	const now = Date.now();

	// Opportunistic cleanup so the map can't grow unbounded.
	if (buckets.size > MAX_BUCKETS) {
		for (const [bucketKey, bucket] of buckets) {
			if (now > bucket.resetAt) buckets.delete(bucketKey);
		}
	}

	let bucket = buckets.get(key);
	if (!bucket || now > bucket.resetAt) {
		bucket = { count: 0, resetAt: now + WINDOW_MS };
		buckets.set(key, bucket);
	}
	bucket.count += 1;

	if (bucket.count > limit) {
		return { limited: true, retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
	}
	return { limited: false, remaining: limit - bucket.count };
}

/**
 * Best-effort client IP for rate limiting. Dev/local requests fall back to
 * "local" so the limiter still applies.
 * @param {Request} request
 * @returns {string}
 */
export function clientIp(request) {
	return (
		request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
		request.headers.get("x-real-ip") ||
		"local"
	);
}

/** Standard 429 response body + Retry-After header. */
export function tooManyRequests(retryAfter = 60) {
	return Response.json(
		{ success: false, error: `Too many requests. Try again in ${retryAfter}s.` },
		{ status: 429, headers: { "Retry-After": String(retryAfter), "Content-Type": "application/json" } }
	);
}
