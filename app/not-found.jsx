import Link from "next/link";

export default function NotFound() {
	return (
		<section className="relative mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 py-24 text-center">
			<div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
			<p className="relative font-mono text-sm font-semibold tracking-[0.3em] text-cyan-300">404</p>
			<h1 className="relative mt-4 font-display text-4xl font-bold text-white sm:text-5xl">This page took a wrong turn</h1>
			<p className="relative mt-4 max-w-md text-sm leading-7 text-slate-400">
				The page you&apos;re looking for doesn&apos;t exist or has moved. Head back to your assessment and we&apos;ll get you on the right path.
			</p>
			<div className="relative mt-8 flex flex-col gap-3 sm:flex-row">
				<Link
					href="/assessment"
					className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 px-6 text-sm font-semibold text-slate-950 transition hover:brightness-110"
				>
					Start assessment
				</Link>
				<Link
					href="/"
					className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/25 hover:bg-white/10"
				>
					Back to home
				</Link>
			</div>
		</section>
	);
}
