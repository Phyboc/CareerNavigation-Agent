export function calculateReadiness(
  userSkills,
  requiredSkills
) {
  const matchedSkills = requiredSkills.filter(
    skill => userSkills.includes(skill)
  );

  const score = Math.round(
    (matchedSkills.length / requiredSkills.length) * 100
  );

  return {
    score,
    matchedSkills
  };
}