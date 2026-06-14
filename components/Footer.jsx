import Link from "next/link";

export default function Footer() {
	return (
		<footer className="border-t border-white/10 bg-slate-950/90">
			<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
				<div className="grid gap-8 md:grid-cols-3">
					<div>
						<p className="text-lg font-semibold text-white">CareerCompass AI</p>
						<p className="mt-2 text-sm leading-7 text-slate-400">
							Your Personal AI Career Mentor — discover your ideal career path, close skill gaps, and build a roadmap for success.
						</p>
					</div>
					<div>
						<p className="text-sm font-semibold text-white">Platform</p>
						<div className="mt-3 flex flex-col gap-2 text-sm text-slate-400">
							<Link href="/assessment" className="hover:text-cyan-200">Assessment</Link>
							<Link href="/analysis" className="hover:text-cyan-200">Analysis</Link>
							<Link href="/resume" className="hover:text-cyan-200">Resume Analyzer</Link>
							<Link href="/roadmap" className="hover:text-cyan-200">Roadmap</Link>
							<Link href="/projects" className="hover:text-cyan-200">Projects</Link>
						</div>
					</div>
					<div>
						<p className="text-sm font-semibold text-white">Built for</p>
						<p className="mt-3 text-sm leading-7 text-slate-400">
							Microsoft Agents League Hackathon — empowering students with AI-driven career guidance.
						</p>
					</div>
				</div>
				<p className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-slate-500">
					© {new Date().getFullYear()} CareerCompass AI. All rights reserved.
				</p>
			</div>
		</footer>
	);
}
