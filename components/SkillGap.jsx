export default function SkillGap({
  missingSkills
}) {
  return (
    <div>
      <h2>Missing Skills</h2>

      <ul>
        {missingSkills.map(skill => (
          <li key={skill}>
            {skill}
          </li>
        ))}
      </ul>
    </div>
  );
}