import { describe, it, expect, vi, afterEach } from "vitest";

import { rateLimit } from "./rateLimit";

afterEach(() => {
	vi.useRealTimers();
});

describe("rateLimit", () => {
	it("allows requests within the window budget", () => {
		expect(rateLimit("basic", 2)).toEqual({ limited: false, remaining: 1 });
	});

	it("limits once the window budget is spent", () => {
		rateLimit("burst", 2); // 1
		rateLimit("burst", 2); // 2
		const third = rateLimit("burst", 2); // 3 > 2
		expect(third.limited).toBe(true);
		expect(third.retryAfter).toBeGreaterThanOrEqual(1);
	});

	it("resets the window after it elapses", () => {
		vi.useFakeTimers();
		vi.setSystemTime(0);
		rateLimit("window", 1); // 1
		expect(rateLimit("window", 1).limited).toBe(true);

		vi.setSystemTime(60_001);
		expect(rateLimit("window", 1).limited).toBe(false);
	});

	it("prunes expired buckets when the map grows past the cap", () => {
		vi.useFakeTimers();
		vi.setSystemTime(0);
		// Fill past the 10k bucket cap (this test must run last – the module
		// map is shared across tests in this file).
		for (let i = 0; i < 10_002; i++) {
			rateLimit(`cleanup-${i}`, 1);
		}
		vi.setSystemTime(60_001);
		// Every bucket is now expired; the next call triggers cleanup and the
		// previously used key gets a fresh window.
		expect(rateLimit("cleanup-0", 1).limited).toBe(false);
	});
});
