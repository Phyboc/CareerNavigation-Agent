"use client";

import { createContext, useContext, useSyncExternalStore, useState, useCallback } from "react";

import { buildAnalysis } from "../lib/analyzer";
import { sampleProfile } from "../lib/sampleProfile";
import { downloadMarkdownReport } from "../lib/exportReport";
import { fetchJson } from "../lib/apiClient";

const STORAGE_KEY = "careercompass-analysis";

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
		const stored = sessionStorage.getItem(STORAGE_KEY);
		if (stored) {
			return JSON.parse(stored);
		}
	} catch {
		// fall through
	}
	return defaultAnalysis;
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
		sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
	} catch {
		// sessionStorage may be unavailable
	}
	emitChange();
}

export function AnalysisProvider({ children }) {
	const analysis = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

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
		<AnalysisContext.Provider value={{ analysis, loading, error, handleAnalyze, exportReport, hydrated: true }}>
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
