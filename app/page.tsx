"use client";

import { useState } from "react";

import StudentForm from "../components/StudentForm";
import SkillGap from "../components/SkillGap";
import ReadinessScore from "../components/ReadinessScore";

import { careerPaths } from "../lib/careerPaths";
import { calculateReadiness } from "../lib/scoring";

export default function Home() {
  const [missingSkills, setMissingSkills] =
    useState([]);

  const [score, setScore] =
    useState(null);

  const handleAnalyze = ({
    skills,
    goal
  }) => {
    const requiredSkills =
      careerPaths[goal];

    const missing =
      requiredSkills.filter(
        skill => !skills.includes(skill)
      );

    const readiness =
      calculateReadiness(
        skills,
        requiredSkills
      );

    setMissingSkills(missing);
    setScore(readiness.score);
  };

  return (
    <main style={{ padding: "2rem" }}>
      <StudentForm
        onAnalyze={handleAnalyze}
      />

      {score !== null && (
        <>
          <ReadinessScore
            score={score}
          />

          <SkillGap
            missingSkills={missingSkills}
          />
        </>
      )}
    </main>
  );
}