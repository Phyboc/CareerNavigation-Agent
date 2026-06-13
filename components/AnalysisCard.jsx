function getRecommendation(score) {
	if (score >= 80) {
		return "You are ready to apply. Keep polishing projects and interview practice.";
	}

	if (score >= 50) {
		return "You are close. Focus on the missing skills and build one portfolio project.";
	}

	return "Build fundamentals first, then revisit this role with a stronger skill base.";
}

function getReadinessLabel(score) {
	if (score >= 80) {
		return "Strong match";
	}

	if (score >= 50) {
		return "Promising fit";
	}

	return "Early stage";
}

export default function AnalysisCard({
	score = 0,
	strengths = [],
	missingSkills = []
}) {
	const recommendation = getRecommendation(score);
	const readinessLabel = getReadinessLabel(score);

	const containerStyle = {
		marginTop: "2rem",
		padding: "1.5rem",
		borderRadius: "24px",
		background:
			"linear-gradient(180deg, rgba(15, 23, 42, 0.96) 0%, rgba(15, 23, 42, 0.88) 100%)",
		color: "#e2e8f0",
		boxShadow: "0 20px 50px rgba(15, 23, 42, 0.25)",
		border: "1px solid rgba(148, 163, 184, 0.18)"
	};

	const sectionStyle = {
		marginTop: "1.5rem"
	};

	const chipRowStyle = {
		display: "flex",
		flexWrap: "wrap",
		gap: "0.75rem",
		marginTop: "0.85rem"
	};

	const chipStyle = {
		padding: "0.55rem 0.8rem",
		borderRadius: "999px",
		fontSize: "0.92rem",
		fontWeight: 600,
		lineHeight: 1,
		border: "1px solid transparent"
	};

	const scoreRingStyle = {
		width: "120px",
		height: "120px",
		borderRadius: "50%",
		display: "grid",
		placeItems: "center",
		background:
			"radial-gradient(circle at top, rgba(56, 189, 248, 0.35), rgba(14, 165, 233, 0.08) 55%, rgba(15, 23, 42, 0.15) 56%), linear-gradient(135deg, rgba(14, 165, 233, 0.28), rgba(59, 130, 246, 0.1))",
		border: "1px solid rgba(125, 211, 252, 0.35)",
		boxShadow: "inset 0 0 0 10px rgba(15, 23, 42, 0.35)"
	};

	return (
		<section style={containerStyle}>
			<div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
				<div style={{ minWidth: 0 }}>
					<p style={{ margin: 0, letterSpacing: "0.14em", textTransform: "uppercase", color: "#7dd3fc", fontSize: "0.78rem", fontWeight: 700 }}>
						Analysis Summary
					</p>
					<h2 style={{ margin: "0.4rem 0 0", fontSize: "1.8rem", lineHeight: 1.1, color: "#f8fafc" }}>
						Career readiness snapshot
					</h2>
					<p style={{ margin: "0.75rem 0 0", color: "#cbd5e1", maxWidth: "42rem", lineHeight: 1.6 }}>
						Strengths, gaps, and next steps based on the skills you entered.
					</p>
				</div>

				<div style={scoreRingStyle}>
					<div style={{ textAlign: "center" }}>
						<div style={{ fontSize: "2rem", fontWeight: 800, color: "#f8fafc" }}>{score}%</div>
						<div style={{ fontSize: "0.82rem", color: "#bae6fd", fontWeight: 600 }}>{readinessLabel}</div>
					</div>
				</div>
			</div>

			<div style={{ marginTop: "1.5rem" }}>
				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "0.6rem", color: "#cbd5e1" }}>
					<span>Readiness progress</span>
					<span>{score}%</span>
				</div>
				<div style={{ height: "12px", borderRadius: "999px", background: "rgba(148, 163, 184, 0.16)", overflow: "hidden" }}>
					<div
						style={{
							width: `${score}%`,
							height: "100%",
							borderRadius: "inherit",
							background: "linear-gradient(90deg, #38bdf8 0%, #60a5fa 50%, #a78bfa 100%)"
						}}
					/>
				</div>
			</div>

			<div style={sectionStyle}>
				<h3 style={{ margin: 0, fontSize: "1rem", color: "#f8fafc" }}>Strengths</h3>
				<div style={chipRowStyle}>
					{strengths.length > 0 ? (
						strengths.map((skill) => (
							<span
								key={skill}
								style={{
									...chipStyle,
									color: "#dcfce7",
									background: "rgba(34, 197, 94, 0.12)",
									borderColor: "rgba(74, 222, 128, 0.24)"
								}}
							>
								{skill}
							</span>
						))
					) : (
						<p style={{ margin: 0, color: "#94a3b8" }}>No matching strengths yet.</p>
					)}
				</div>
			</div>

			<div style={sectionStyle}>
				<h3 style={{ margin: 0, fontSize: "1rem", color: "#f8fafc" }}>Missing skills</h3>
				<div style={chipRowStyle}>
					{missingSkills.length > 0 ? (
						missingSkills.map((skill) => (
							<span
								key={skill}
								style={{
									...chipStyle,
									color: "#fee2e2",
									background: "rgba(239, 68, 68, 0.12)",
									borderColor: "rgba(248, 113, 113, 0.24)"
								}}
							>
								{skill}
							</span>
						))
					) : (
						<p style={{ margin: 0, color: "#94a3b8" }}>No gaps found. The profile matches the target role well.</p>
					)}
				</div>
			</div>

			<div style={{ ...sectionStyle, padding: "1rem 1rem 0.9rem", borderRadius: "18px", background: "rgba(15, 23, 42, 0.75)", border: "1px solid rgba(148, 163, 184, 0.14)" }}>
				<h3 style={{ margin: 0, fontSize: "1rem", color: "#f8fafc" }}>Recommendation</h3>
				<p style={{ margin: "0.55rem 0 0", color: "#cbd5e1", lineHeight: 1.65 }}>
					{recommendation}
				</p>
			</div>
		</section>
	);
}
