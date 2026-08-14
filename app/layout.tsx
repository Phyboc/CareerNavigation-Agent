import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AnalysisProvider } from "../context/AnalysisContext";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const outfit = Outfit({
	variable: "--font-outfit",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "CareerCompass AI — Your Personal AI Career Mentor",
	description: "Discover your ideal career path, close skill gaps, and build a roadmap for success with AI-powered guidance.",
	openGraph: {
		title: "CareerCompass AI — Your Personal AI Career Mentor",
		description: "Analyze your skills, gauge your projects, and get a personalized AI career roadmap.",
		type: "website"
	}
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			data-scroll-behavior="smooth"
			className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} h-full antialiased`}
			suppressHydrationWarning={true}
		>
			<head>
				<script
					dangerouslySetInnerHTML={{
						__html: `(function(){
							try {
								var stored = localStorage.getItem("careercompass-theme");
								var dark = stored === "dark" || (stored !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
								if (dark) document.documentElement.classList.add("dark");
							} catch (e) {}
						})();`
					}}
				/>
			</head>
			<body className="flex min-h-full flex-col bg-slate-950 text-slate-100">
				<a
					href="#main"
					className="fixed left-4 top-4 z-50 -translate-y-16 rounded-full border border-cyan-600/30 bg-white px-4 py-2 text-sm font-semibold text-cyan-800 shadow-lg transition focus:translate-y-0"
				>
					Skip to content
				</a>
				<AnalysisProvider>
					<Navbar />
					<main id="main" className="flex-1">{children}</main>
					<Footer />
				</AnalysisProvider>
			</body>
		</html>
	);
}
