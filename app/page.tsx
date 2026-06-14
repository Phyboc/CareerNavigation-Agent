"use client";

import { useState } from "react";

import StudentForm from "../components/StudentForm";
import ReadinessScore from "../components/ReadinessScore";
import CareerMatches from "../components/CareerMatches";
import SkillGap from "../components/SkillGap";
import ResumeAnalyzer from "../components/ResumeAnalyzer";
import Roadmap from "../components/Roadmap";
import StudyPlan from "../components/StudyPlan";
import ProjectRecommendations from "../components/ProjectRecommendations";
import ResourceCards from "../components/ResourceCards";

import { analyzeCareerProfile } from "../lib/analyzer";
import { sampleProfile } from "../lib/sampleProfile";

const workflow = [
  "Profile Analysis",
  "Skill Gap Analysis",
  "Readiness Assessment",
  "Roadmap Generation",
  "Study Plan Generation"
];

export default function Home() {
  const [analysis, setAnalysis] = useState<any>(() => analyzeCareerProfile(sampleProfile));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async (formData: {
    name: string;
    degree: string;
    skills: string;
    projects: string;
    goal: string;
    hoursPerDay: number;
  }) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Analysis failed");
      }

      setAnalysis(payload);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to analyze profile.");
      setAnalysis(analyzeCareerProfile(formData));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_transparent_34%),linear-gradient(180deg,_#020617_0%,_#0f172a_55%,_#020617_100%)] text-slate-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-7 shadow-[0_30px_80px_rgba(2,6,23,0.28)] backdrop-blur sm:p-9">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">Microsoft Agents League Hackathon</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">CareerNavigation Agent</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">An AI-powered career guidance dashboard that evaluates readiness, detects skill gaps, generates a roadmap, builds a weekly study plan, and recommends trusted resources.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 transition duration-200 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-slate-950/80 hover:shadow-[0_16px_40px_rgba(8,145,178,0.12)]">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Output</p>
                <p className="mt-2 text-2xl font-semibold text-white">Structured JSON</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">Readable enough for demos, structured enough for integration.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 transition duration-200 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-slate-950/80 hover:shadow-[0_16px_40px_rgba(8,145,178,0.12)]">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Focus</p>
                <p className="mt-2 text-2xl font-semibold text-white">Demo quality</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">Clear story, clean hierarchy, and quick scanning.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 transition duration-200 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-slate-950/80 hover:shadow-[0_16px_40px_rgba(8,145,178,0.12)]">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Approach</p>
                <p className="mt-2 text-2xl font-semibold text-white">Simple stack</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">Fast to explain, easy to extend, and easy to ship.</p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-cyan-400/15 bg-slate-950/80 p-7 shadow-[0_30px_80px_rgba(2,6,23,0.28)] backdrop-blur sm:p-9">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">Sample profile</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Expected output example</h2>
            <div className="mt-5 grid gap-3 text-sm leading-6 text-slate-300">
              <p><span className="text-slate-500">Name:</span> {sampleProfile.name}</p>
              <p><span className="text-slate-500">Degree:</span> {sampleProfile.degree}</p>
              <p><span className="text-slate-500">Skills:</span> {sampleProfile.skills}</p>
              <p><span className="text-slate-500">Projects:</span> {sampleProfile.projects}</p>
              <p><span className="text-slate-500">Goal:</span> {sampleProfile.goal}</p>
              <p><span className="text-slate-500">Hours:</span> {sampleProfile.hoursPerDay} per day</p>
            </div>
            <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
              Readiness, roadmap, weekly plan, and resources are rendered from the same analysis engine used by the API route.
            </div>
          </div>
        </section>

        <StudentForm onAnalyze={handleAnalyze} loading={loading} />

        <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.18)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Agent workflow</p>
          <div className="mt-5 grid gap-4 md:grid-cols-5">
            {workflow.map((step, index) => (
              <div key={step} className="rounded-3xl border border-white/10 bg-slate-950/75 p-4 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-sm font-bold text-slate-950">0{index + 1}</div>
                <p className="text-sm font-semibold text-white">{step}</p>
                {index < workflow.length - 1 && <p className="mt-2 text-xs text-slate-500">↓</p>}
              </div>
            ))}
          </div>
        </section>

        {loading ? (
          <div className="rounded-[28px] border border-cyan-400/20 bg-cyan-400/10 px-5 py-4 text-sm leading-6 text-cyan-50 shadow-[0_16px_40px_rgba(8,145,178,0.12)]">
            Analyzing profile and refreshing the dashboard cards...
          </div>
        ) : null}

        {error ? (
          <div className="rounded-[28px] border border-amber-400/20 bg-amber-400/10 px-5 py-4 text-sm leading-6 text-amber-100 shadow-[0_16px_40px_rgba(217,119,6,0.08)]">{error}</div>
        ) : null}

        <ReadinessScore
          score={analysis.readiness.score}
          strengths={analysis.readiness.strengths}
          weaknesses={analysis.readiness.weaknesses}
        />

        <CareerMatches
          matches={analysis.careerMatches}
          selectedCareer={analysis.profile.goal}
        />

        <SkillGap
          existingSkills={analysis.skillGap.existingSkills}
          missingSkills={analysis.skillGap.missingSkills}
          prioritySkills={analysis.skillGap.prioritySkills}
        />

        <ResumeAnalyzer targetCareer={analysis.profile.goal} />

        <Roadmap roadmap={analysis.roadmap} />
        <ProjectRecommendations
          careerGoal={analysis.profile.goal}
          projects={analysis.projectRecommendations}
        />
        <StudyPlan weeklySchedule={analysis.weeklySchedule} />
        <ResourceCards resources={analysis.resources} />

        <section className="rounded-[28px] border border-white/10 bg-slate-950/80 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.2)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">AI summary</p>
          <h3 className="mt-2 text-xl font-semibold text-white">What the agent would say</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-medium text-slate-200">Strengths</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">{analysis.readiness.strengths.join(", ") || "Skills are being evaluated."}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-medium text-slate-200">Weaknesses</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">{analysis.readiness.weaknesses.join(", ") || "No major weaknesses detected."}</p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-7 text-slate-300">{analysis.readiness.summary}</p>
        </section>
      </div>
    </main>
  );
}