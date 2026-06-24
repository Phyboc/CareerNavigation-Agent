import Link from "next/link";

export default function Footer() {
	return (
		<footer className="border-t border-white/5 bg-slate-950/70 backdrop-blur-md">
			<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
				<div className="grid gap-8 md:grid-cols-3">
					<div>
						<p className="font-display text-lg font-bold text-white tracking-tight">CareerCompass AI</p>
						<p className="mt-3 text-sm leading-relaxed text-slate-400">
							Your Personal AI Career Mentor — discover your ideal career path, close skill gaps, and build a roadmap for success.
						</p>
					</div>
					<div>
						<p className="text-sm font-semibold uppercase tracking-wider text-slate-300">Platform</p>
						<div className="mt-4 flex flex-col gap-2.5 text-sm text-slate-400">
							<Link href="/assessment" className="hover:text-cyan-400 transition">Assessment</Link>
							<Link href="/analysis" className="hover:text-cyan-400 transition">Analysis</Link>
							<Link href="/resume" className="hover:text-cyan-400 transition">Resume Analyzer</Link>
							<Link href="/roadmap" className="hover:text-cyan-400 transition">Roadmap</Link>
							<Link href="/projects" className="hover:text-cyan-400 transition">Projects</Link>
						</div>
					</div>
					<div>
						<p className="text-sm font-semibold uppercase tracking-wider text-slate-300">Built For</p>
						<p className="mt-4 text-sm leading-relaxed text-slate-400">
							Microsoft Agents League Hackathon — empowering students with AI-driven career guidance.
						</p>
					</div>
				</div>
				<div className="mt-10 border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
					<p>© {new Date().getFullYear()} CareerCompass AI. All rights reserved.</p>
					<div className="flex gap-4">
						<Link href="#" className="hover:text-slate-300 transition">Privacy Policy</Link>
						<Link href="#" className="hover:text-slate-300 transition">Terms of Service</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}
