"use client";

import { createContext, useContext, useSyncExternalStore, useState, useCallback } from "react";

import { buildAnalysis } from "../lib/analyzer";
import { sampleProfile } from "../lib/sampleProfile";
import { downloadMarkdownReport } from "../lib/exportReport";
import { fetchJson } from "../lib/apiClient";

const STORAGE_KEY = "careercompass-analysis";
const HISTORY_KEY = "careercompass-history";
const MAX_HISTORY = 20;

const AnalysisContext = createContext(null);

// Deterministic, synchronous – never a Promise, so the store always holds data.
const defaultAnalysis = buildAnalysis(sampleProfile);
let analysisCache = defaultAnalysis;
const listeners = new Set();

function emitChange() {
	listeners.forEach(listener => listener());
}

function readStoredAnalysis() {
	if (typeof window === "undefined") {
		return defaultAnalysis;
	}
	try {
		// localStorage persists across sessions; sessionStorage is read as a
		// fallback for tabs opened before this change.
		const stored = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
		if (stored) {
			return JSON.parse(stored);
		}
	} catch {
		// fall through
	}
	return defaultAnalysis;
}

function readHistory() {
	if (typeof window === "undefined") {
		return [];
	}
	try {
		const stored = localStorage.getItem(HISTORY_KEY);
		const parsed = stored ? JSON.parse(stored) : [];
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

function subscribe(listener) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

function getSnapshot() {
	if (typeof window !== "undefined" && analysisCache === defaultAnalysis) {
		analysisCache = readStoredAnalysis();
	}
	return analysisCache;
}

function getServerSnapshot() {
	return defaultAnalysis;
}

function setAnalysisCache(next) {
	analysisCache = next;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
	} catch {
		// storage may be unavailable
	}
	emitChange();
}

export function AnalysisProvider({ children }) {
	const analysis = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	// Readiness snapshots over time – lets users track progress across sessions.
	const [history, setHistory] = useState(readHistory);

	// Record a snapshot only when the user actually runs an assessment. This
	// deliberately avoids a mount effect: page visits must not silently re-add
	// duplicate history entries (which would make "Clear progress" pointless).
	const recordHistory = useCallback((nextAnalysis) => {
		if (!nextAnalysis || typeof nextAnalysis !== "object") return;
		const entry = {
			savedAt: Date.now(),
			name: nextAnalysis.profile?.name || "Student",
			goal: nextAnalysis.profile?.goal || "",
			readinessScore: nextAnalysis.readiness?.score ?? 0
		};
		setHistory(previous => {
			// Skip an exact repeat of the last snapshot (same inputs re-run).
			const last = previous[previous.length - 1];
			if (
				last &&
				last.name === entry.name &&
				last.goal === entry.goal &&
				last.readinessScore === entry.readinessScore
			) {
				return previous;
			}
			const next = [...previous, entry].slice(-MAX_HISTORY);
			try {
				localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
			} catch {
				// storage may be unavailable
			}
			return next;
		});
	}, []);

	const handleAnalyze = useCallback(async (formData) => {
		setLoading(true);
		setError("");

		try {
			// Fast path: /api/analyze runs the deterministic engine and returns
			// instantly, so the user sees results without waiting on the LLM.
			const payload = await fetchJson("/api/analyze", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
				timeoutMs: 15000
			});

			setAnalysisCache(payload);
			recordHistory(payload);

			// Background enrichment: when a resume was pasted, merge its
			// AI-detected skills into the profile and update the cache in place.
			// Not awaited – the user is already looking at deterministic results.
			if (formData?.resumeText?.trim()) {
				fetchJson("/api/analyze/enrich", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(formData),
					timeoutMs: 25000
				})
					.then(enriched => {
						if (enriched?.success) setAnalysisCache(enriched);
					})
					.catch(err => {
						console.warn("Background resume enrichment failed (deterministic results kept):", err);
					});
			}
		} catch (caughtError) {
			setError(caughtError instanceof Error ? caughtError.message : "Unable to analyze profile.");
			const fallback = buildAnalysis(formData);
			setAnalysisCache(fallback);
			recordHistory(fallback);
		} finally {
			setLoading(false);
		}
	}, [recordHistory]);

	const exportReport = useCallback(async () => {
		if (analysis) {
			await downloadMarkdownReport(analysis);
		}
	}, [analysis]);

	// Delete the saved progress history (score snapshots). The current analysis
	// is kept – only the history is wiped.
	const clearHistory = useCallback(() => {
		try {
			localStorage.removeItem(HISTORY_KEY);
		} catch {
			// storage may be unavailable
		}
		setHistory([]);
	}, []);

	return (
		<AnalysisContext.Provider
			value={{ analysis, loading, error, handleAnalyze, exportReport, history, clearHistory, hydrated: true }}
		>
			{children}
		</AnalysisContext.Provider>
	);
}

export function useAnalysis() {
	const context = useContext(AnalysisContext);
	if (!context) {
		throw new Error("useAnalysis must be used within AnalysisProvider");
	}
	return context;
}
