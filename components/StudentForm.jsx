"use client";

import { useState } from "react";

export default function StudentForm({ onAnalyze }) {
  const [skills, setSkills] = useState("");
  const [goal, setGoal] = useState("AI Engineer");

  const handleSubmit = (e) => {
    e.preventDefault();

    const skillArray = skills
      .split(",")
      .map(skill => skill.trim());

    onAnalyze({
      skills: skillArray,
      goal
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>CareerCompass Agent</h2>

      <textarea
        placeholder="Python, Java, Git"
        value={skills}
        onChange={(e) => setSkills(e.target.value)}
      />

      <br />

      <select
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
      >
        <option>AI Engineer</option>
        <option>Software Engineer</option>
        <option>Data Scientist</option>
        <option>Full Stack Developer</option>
      </select>

      <br />

      <button type="submit">
        Analyze
      </button>
    </form>
  );
}