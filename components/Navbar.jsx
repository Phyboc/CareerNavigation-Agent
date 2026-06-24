"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
	{ href: "/", label: "Home" },
	{ href: "/assessment", label: "Assessment" },
	{ href: "/resume", label: "Resume Analyzer" },
	{ href: "/roadmap", label: "Roadmap" },
	{ href: "/projects", label: "Projects" }
];

export default function Navbar() {
	const pathname = usePathname();
	const [open, setOpen] = useState(false);

	return (
		<header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/70 backdrop-blur-md">
			<div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
				<Link href="/" className="flex items-center gap-3">
					<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 font-display text-sm font-black text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
						CC
					</span>
					<div>
						<p className="font-display text-base font-bold tracking-tight text-white leading-tight">CareerCompass AI</p>
						<p className="hidden text-[10px] uppercase tracking-widest text-cyan-400 font-semibold sm:block">AI Career Mentor</p>
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
										? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
										: "text-slate-300 border border-transparent hover:bg-white/5 hover:text-white"
								}`}
							>
								{item.label}
							</Link>
						);
					})}
					<Link
						href="/analysis"
						className="ml-3 inline-flex h-10 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 text-sm font-semibold text-slate-950 shadow-[0_4px_20px_rgba(6,182,212,0.25)] transition duration-200 hover:brightness-110 active:scale-[0.98] active:translate-y-[0.5px]"
					>
						View Analysis
					</Link>
				</nav>

				<button
					type="button"
					aria-label="Toggle navigation menu"
					onClick={() => setOpen(prev => !prev)}
					className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-slate-300 hover:text-white transition md:hidden"
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

			{open ? (
				<nav className="border-t border-white/5 bg-slate-950/95 backdrop-blur-md px-4 py-4 md:hidden animate-fade-in">
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
											? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
											: "text-slate-300 hover:bg-white/5"
									}`}
								>
									{item.label}
								</Link>
							);
						})}
						<Link
							href="/analysis"
							onClick={() => setOpen(false)}
							className="mt-2 inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-4 text-sm font-semibold text-slate-950 shadow-[0_4px_15px_rgba(6,182,212,0.25)]"
						>
							View Analysis
						</Link>
					</div>
				</nav>
			) : null}
		</header>
	);
}
