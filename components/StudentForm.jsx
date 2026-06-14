"use client";

import { useState } from "react";

export default function StudentForm({ onAnalyze, loading = false }) {
  const [form, setForm] = useState({
    name: "",
    degree: "",
    skills: "Python, Java, DSA, Git, MySQL",
    projects: "Drowsiness Detection System",
    goal: "AI Engineer",
    hours: "3"
  });

  const handleChange = (field) => (event) => {
    setForm(previous => ({
      ...previous,
      [field]: event.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onAnalyze({
      name: form.name,
      degree: form.degree,
      skills: form.skills,
      projects: form.projects,
      goal: form.goal,
      hoursPerDay: Number(form.hours)
    });
  };

  const loadSample = () => {
    setForm({
      name: "Sivasubramani",
      degree: "B.Tech CSE + IITM BS Data Science",
      skills: "Python, Java, DSA, Git, MySQL",
      projects: "Drowsiness Detection System",
      goal: "AI Engineer",
      hours: "3"
    });
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-[0_30px_80px_rgba(2,6,23,0.3)] backdrop-blur sm:p-8">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Student profile form</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Analyze a student profile</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Enter the profile details and run the reasoning workflow. The same shape is used by the API route and the dashboard.</p>
        </div>
        <button type="button" onClick={loadSample} className="inline-flex h-11 items-center justify-center rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20">
          Load sample profile
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-200">
          <span className="font-medium">Name</span>
          <input value={form.name} onChange={handleChange("name")} placeholder="Student name" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:bg-white/10" />
        </label>

        <label className="space-y-2 text-sm text-slate-200">
          <span className="font-medium">Degree</span>
          <input value={form.degree} onChange={handleChange("degree")} placeholder="B.Tech, B.Sc, MCA" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:bg-white/10" />
        </label>

        <label className="space-y-2 text-sm text-slate-200 md:col-span-2">
          <span className="font-medium">Current Skills</span>
          <textarea value={form.skills} onChange={handleChange("skills")} rows={3} placeholder="Python, Java, Git, MySQL" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:bg-white/10" />
        </label>

        <label className="space-y-2 text-sm text-slate-200 md:col-span-2">
          <span className="font-medium">Projects</span>
          <textarea value={form.projects} onChange={handleChange("projects")} rows={3} placeholder="Project highlights" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:bg-white/10" />
        </label>

        <label className="space-y-2 text-sm text-slate-200">
          <span className="font-medium">Career Goal</span>
          <select value={form.goal} onChange={handleChange("goal")} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-cyan-400/50 focus:bg-white/10">
            <option>AI Engineer</option>
            <option>Software Engineer</option>
            <option>Data Scientist</option>
            <option>Full Stack Developer</option>
          </select>
        </label>

        <label className="space-y-2 text-sm text-slate-200">
          <span className="font-medium">Study Hours Per Day</span>
          <input type="number" min="1" max="12" value={form.hours} onChange={handleChange("hours")} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:bg-white/10" />
        </label>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="submit" disabled={loading} className="inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-6 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70">
          {loading ? "Analyzing profile..." : "Run agent workflow"}
        </button>
        <p className="text-sm text-slate-400">No auth. No database. Hackathon-friendly and easy to demo.</p>
      </div>
    </form>
  );
}