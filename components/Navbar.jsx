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
		<header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
			<div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
				<Link href="/" className="flex items-center gap-2">
					<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 text-sm font-bold text-slate-950">
						CC
					</span>
					<div>
						<p className="text-sm font-semibold text-white">CareerCompass AI</p>
						<p className="hidden text-xs text-slate-400 sm:block">Your Personal AI Career Mentor</p>
					</div>
				</Link>

				<nav className="hidden items-center gap-1 md:flex">
					{navItems.map(item => {
						const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
						return (
							<Link
								key={item.href}
								href={item.href}
								className={`rounded-full px-4 py-2 text-sm font-medium transition ${
									active
										? "bg-cyan-400/15 text-cyan-100"
										: "text-slate-300 hover:bg-white/5 hover:text-white"
								}`}
							>
								{item.label}
							</Link>
						);
					})}
					<Link
						href="/analysis"
						className="ml-2 inline-flex h-10 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-110"
					>
						View Analysis
					</Link>
				</nav>

				<button
					type="button"
					aria-label="Toggle navigation menu"
					onClick={() => setOpen(prev => !prev)}
					className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white md:hidden"
				>
					{open ? "✕" : "☰"}
				</button>
			</div>

			{open ? (
				<nav className="border-t border-white/10 px-4 py-4 md:hidden">
					<div className="flex flex-col gap-2">
						{navItems.map(item => {
							const active = pathname === item.href;
							return (
								<Link
									key={item.href}
									href={item.href}
									onClick={() => setOpen(false)}
									className={`rounded-2xl px-4 py-3 text-sm font-medium ${
										active ? "bg-cyan-400/15 text-cyan-100" : "text-slate-300 hover:bg-white/5"
									}`}
								>
									{item.label}
								</Link>
							);
						})}
						<Link
							href="/analysis"
							onClick={() => setOpen(false)}
							className="mt-2 inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-4 text-sm font-semibold text-slate-950"
						>
							View Analysis
						</Link>
					</div>
				</nav>
			) : null}
		</header>
	);
}
