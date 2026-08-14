"use client";

import { createContext, useContext, useSyncExternalStore, useEffect, useState, useCallback } from "react";

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

	useEffect(() => {
		if (!analysis || analysis === defaultAnalysis) return;
		const entry = {
			savedAt: Date.now(),
			name: analysis.profile?.name || "Student",
			goal: analysis.profile?.goal || "",
			readinessScore: analysis.readiness?.score ?? 0
		};
		setHistory(previous => {
			const next = [...previous, entry].slice(-MAX_HISTORY);
			try {
				localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
			} catch {
				// storage may be unavailable
			}
			return next;
		});
	}, [analysis]);

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
			setAnalysisCache(buildAnalysis(formData));
		} finally {
			setLoading(false);
		}
	}, []);

	const exportReport = useCallback(async () => {
		if (analysis) {
			await downloadMarkdownReport(analysis);
		}
	}, [analysis]);

	return (
		<AnalysisContext.Provider value={{ analysis, loading, error, handleAnalyze, exportReport, history, hydrated: true }}>
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
