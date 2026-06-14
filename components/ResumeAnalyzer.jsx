"use client";

import { useState } from "react";

import { analyzeResumeText } from "../lib/analyzer";

const initialText = `Summary
Built a Drowsiness Detection System using Python and machine learning.
Skills: Python, Java, Git, MySQL
Projects: personal AI project, college assignments
`;

export default function ResumeAnalyzer({ targetCareer = "AI Engineer" }) {
  const [resumeText, setResumeText] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    const textToAnalyze = resumeText.trim() || initialText;
    setAnalysis(analyzeResumeText(textToAnalyze, targetCareer));
    setIsAnalyzing(false);
  };

  const loadSample = () => {
    setResumeText(initialText);
    setAnalysis(analyzeResumeText(initialText, targetCareer));
  };

  return (
    <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.22)] backdrop-blur transition duration-200 hover:-translate-y-1 hover:border-cyan-400/20 hover:shadow-[0_24px_60px_rgba(8,145,178,0.12)]">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">Resume analysis</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">Paste resume text for keyword matching</h3>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">The analyzer detects strengths, skills, missing skills, and suggestions using simple keyword matching against the chosen career path.</p>
        </div>
        <button type="button" onClick={loadSample} className="inline-flex h-11 items-center justify-center rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20">
          Load sample resume
        </button>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-3">
          <textarea
            value={resumeText}
            onChange={(event) => setResumeText(event.target.value)}
            rows={12}
            placeholder="Paste resume text here..."
            className="w-full rounded-[28px] border border-white/10 bg-slate-950/80 px-4 py-4 text-sm leading-7 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:bg-slate-950"
          />
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={handleAnalyze} className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70" disabled={isAnalyzing}>
              {isAnalyzing ? "Analyzing..." : "Analyze resume"}
            </button>
            <p className="flex items-center text-sm text-slate-400">Target career: {targetCareer}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4 transition duration-200 hover:border-emerald-400/20 hover:bg-slate-950/90">
            <p className="text-sm font-semibold tracking-wide text-white">Detected strengths</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {analysis?.strengths?.length > 0 ? analysis.strengths.map((item) => (
                <span key={item} className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm text-emerald-50">{item}</span>
              )) : <p className="text-sm text-slate-400">Paste resume text to reveal strengths.</p>}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4 transition duration-200 hover:border-sky-400/20 hover:bg-slate-950/90">
            <p className="text-sm font-semibold tracking-wide text-white">Detected skills</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {analysis?.detectedSkills?.length > 0 ? analysis.detectedSkills.map((item) => (
                <span key={item} className="rounded-full bg-sky-400/15 px-3 py-1 text-sm text-sky-50">{item}</span>
              )) : <p className="text-sm text-slate-400">Detected keywords will appear here.</p>}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4 transition duration-200 hover:border-cyan-400/20 hover:bg-slate-950/90">
            <p className="text-sm font-semibold tracking-wide text-white">Match score</p>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
              <div className={`h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 transition-all duration-500 ${isAnalyzing ? "animate-pulse" : ""}`} style={{ width: `${analysis?.matchScore ?? 0}%` }} />
            </div>
            <p className="mt-2 text-sm text-slate-400">{analysis ? `${analysis.matchScore}% keyword alignment` : "Keyword alignment will appear here."}</p>
          </div>
        </div>
      </div>

      {analysis ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-rose-400/15 bg-rose-400/5 p-4 transition duration-200 hover:border-rose-400/30 hover:bg-rose-400/8">
            <p className="text-sm font-semibold tracking-wide text-rose-200">Missing skills</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {analysis.missingSkills.length > 0 ? analysis.missingSkills.map((item) => (
                <span key={item} className="rounded-full bg-rose-400/15 px-3 py-1 text-sm text-rose-50">{item}</span>
              )) : <p className="text-sm text-slate-400">No major skill gaps detected.</p>}
            </div>
          </div>

          <div className="rounded-3xl border border-amber-400/15 bg-amber-400/5 p-4 transition duration-200 hover:border-amber-400/30 hover:bg-amber-400/8">
            <p className="text-sm font-semibold tracking-wide text-amber-200">Suggestions</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-200">
              {analysis.suggestions.map((item) => <li key={item}>• {item}</li>)}
            </ul>
          </div>
        </div>
      ) : null}
    </section>
  );
}