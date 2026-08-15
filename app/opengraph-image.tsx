import { ImageResponse } from "next/og";

export const size = {
	width: 1200,
	height: 630
};

export const contentType = "image/png";

export const alt = "CareerCompass AI — Your Personal AI Career Mentor";

export default async function OpenGraphImage() {
	return new ImageResponse(
		(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					background: "linear-gradient(135deg, #faf6ee 0%, #ece4d4 100%)",
					fontFamily: "sans-serif"
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: 32 }}>
					<div
						style={{
							width: 128,
							height: 128,
							borderRadius: 30,
							background: "linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							fontSize: 56,
							fontWeight: 900,
							color: "#ffffff"
						}}
					>
						CC
					</div>
					<div style={{ display: "flex", flexDirection: "column" }}>
						<div style={{ fontSize: 68, fontWeight: 800, color: "#0f172a", letterSpacing: -1 }}>
							CareerCompass AI
						</div>
						<div style={{ fontSize: 34, color: "#0e7490", marginTop: 12, fontWeight: 600 }}>
							Your Personal AI Career Mentor
						</div>
					</div>
				</div>
				<div style={{ display: "flex", gap: 20, marginTop: 56, fontSize: 24, color: "#475569" }}>
					<span>Assess your skills</span>
					<span>·</span>
					<span>Close your gaps</span>
					<span>·</span>
					<span>Navigate your career</span>
				</div>
			</div>
		),
		{ ...size }
	);
}
