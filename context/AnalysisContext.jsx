"use client";

import { createContext, useContext, useSyncExternalStore, useState, useCallback } from "react";

import { analyzeCareerProfile } from "../lib/analyzer";
import { sampleProfile } from "../lib/sampleProfile";
import { downloadMarkdownReport } from "../lib/exportReport";

const STORAGE_KEY = "careercompass-analysis";

const AnalysisContext = createContext(null);

const defaultAnalysis = analyzeCareerProfile(sampleProfile);
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
			const response = await fetch("/api/analyze", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData)
			});

			const payload = await response.json();
			if (!response.ok || !payload.success) {
				throw new Error(payload.error || "Analysis failed");
			}

			setAnalysisCache(payload);
		} catch (caughtError) {
			setError(caughtError instanceof Error ? caughtError.message : "Unable to analyze profile.");
			setAnalysisCache(analyzeCareerProfile(formData));
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
