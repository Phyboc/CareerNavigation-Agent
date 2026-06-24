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
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} h-full antialiased`}
			suppressHydrationWarning={true}
		>
			<body className="flex min-h-full flex-col bg-slate-950 text-slate-100">
				<AnalysisProvider>
					<Navbar />
					<main className="flex-1">{children}</main>
					<Footer />
				</AnalysisProvider>
			</body>
		</html>
	);
}
