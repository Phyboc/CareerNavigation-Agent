import Link from "next/link";

export default function NotFound() {
	return (
		<section className="relative mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 py-24 text-center">
			<div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-600/10 blur-3xl" />
			<p className="relative font-mono text-sm font-semibold tracking-[0.3em] text-cyan-700">404</p>
			<h1 className="relative mt-4 font-display text-4xl font-bold text-slate-100 sm:text-5xl">This page took a wrong turn</h1>
			<p className="relative mt-4 max-w-md text-sm leading-7 text-slate-400">
				The page you&apos;re looking for doesn&apos;t exist or has moved. Head back to your assessment and we&apos;ll get you on the right path.
			</p>
			<div className="relative mt-8 flex flex-col gap-3 sm:flex-row">
				<Link
					href="/assessment"
					className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-cyan-700 px-6 text-sm font-semibold text-white transition hover:brightness-110 dark:from-cyan-600 dark:to-cyan-900"
				>
					Start assessment
				</Link>
				<Link
					href="/"
					className="inline-flex h-11 items-center justify-center rounded-full border border-slate-700/25 bg-white px-6 text-sm font-semibold text-slate-200 transition hover:border-cyan-600/40 hover:bg-slate-900"
				>
					Back to home
				</Link>
			</div>
		</section>
	);
}
