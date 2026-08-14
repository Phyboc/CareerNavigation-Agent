"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
	{ href: "/", label: "Home" },
	{ href: "/assessment", label: "Assessment" },
	{ href: "/resume", label: "Resume Analyzer" },
	{ href: "/roadmap", label: "Roadmap" },
	{ href: "/projects", label: "Projects" },
	{ href: "/chat", label: "AI Chat" }
];

export default function Navbar() {
	const pathname = usePathname();
	const [open, setOpen] = useState(false);
	const [dark, setDark] = useState(false);

	// Sync the toggle with the <html> class after mount (the layout script
	// already applied the stored/system theme before paint).
	useEffect(() => {
		setDark(document.documentElement.classList.contains("dark"));
	}, []);

	const toggleTheme = () => {
		setDark(previous => {
			const next = !previous;
			try {
				localStorage.setItem("careercompass-theme", next ? "dark" : "light");
			} catch {
				// localStorage may be unavailable
			}
			document.documentElement.classList.toggle("dark", next);
			return next;
		});
	};

	return (
		<header className="sticky top-0 z-50 border-b border-slate-700/20 bg-white/80 backdrop-blur-md">
			<div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
				<Link href="/" className="flex items-center gap-3">
					<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-700 font-display text-sm font-black text-white shadow-[0_0_20px_rgba(15,118,110,0.25)] dark:from-cyan-600 dark:to-cyan-900">
						CC
					</span>
					<div>
						<p className="font-display text-base font-bold tracking-tight text-slate-100 leading-tight">CareerCompass AI</p>
						<p className="hidden text-[10px] uppercase tracking-widest text-cyan-700 font-semibold sm:block">AI Career Mentor</p>
					</div>
				</Link>

				<nav className="hidden items-center gap-1.5 md:flex">
					{navItems.map(item => {
						const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
						return (
							<Link
								key={item.href}
								href={item.href}
								className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
								active
									? "bg-cyan-600/10 text-cyan-800 border border-cyan-600/25"
									: "text-slate-200 border border-transparent hover:bg-slate-900 hover:text-slate-100"
								}`}
							>
								{item.label}
							</Link>
						);
					})}
					<Link
						href="/analysis"
						className="ml-3 inline-flex h-10 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-cyan-700 px-5 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(15,118,110,0.25)] transition duration-200 hover:brightness-110 active:scale-[0.98] active:translate-y-[0.5px] dark:from-cyan-600 dark:to-cyan-900"
					>
						View Analysis
					</Link>
				</nav>

				<div className="flex items-center gap-2">
					<button
						type="button"
						aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
						onClick={toggleTheme}
						className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700/25 bg-white text-slate-300 hover:text-slate-100 transition"
					>
						{dark ? (
							<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
							</svg>
						) : (
							<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
							</svg>
						)}
					</button>
					<button
						type="button"
						aria-label="Toggle navigation menu"
						onClick={() => setOpen(prev => !prev)}
						className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700/25 bg-white text-slate-300 hover:text-slate-100 transition md:hidden"
					>
					{open ? (
						<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					) : (
						<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
						</svg>
					)}
					</button>
				</div>
				</div>

			{open ? (
				<nav className="border-t border-slate-700/20 bg-white/95 backdrop-blur-md px-4 py-4 md:hidden animate-fade-in">
					<div className="flex flex-col gap-2">
						{navItems.map(item => {
							const active = pathname === item.href;
							return (
								<Link
									key={item.href}
									href={item.href}
									onClick={() => setOpen(false)}
									className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
									active
										? "bg-cyan-600/10 text-cyan-800 border border-cyan-600/25"
										: "text-slate-200 hover:bg-slate-900"
									}`}
								>
									{item.label}
								</Link>
							);
						})}
						<Link
							href="/analysis"
							onClick={() => setOpen(false)}
							className="mt-2 inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-cyan-700 px-4 text-sm font-semibold text-white shadow-[0_4px_15px_rgba(15,118,110,0.25)] dark:from-cyan-600 dark:to-cyan-900"
						>
							View Analysis
						</Link>
					</div>
				</nav>
			) : null}
		</header>
	);
}
