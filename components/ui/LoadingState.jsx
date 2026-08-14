export default function LoadingState({ message = "Analyzing your profile..." }) {
	return (
		<div className="space-y-4">
			<p className="text-xs font-medium tracking-wide text-cyan-700">{message}</p>
			<div className="rounded-[28px] border border-slate-700/25 bg-white/80 p-6 backdrop-blur">
				<div className="flex items-center justify-between gap-4">
					<div className="skeleton h-8 w-48 rounded-full" />
					<div className="skeleton h-8 w-20 rounded-full" />
				</div>
				<div className="skeleton mt-6 h-2.5 w-full rounded-full" />
				<div className="mt-5 grid gap-3 sm:grid-cols-3">
					<div className="space-y-2.5">
						<div className="skeleton h-3 w-2/3 rounded-full" />
						<div className="skeleton h-2.5 w-full rounded-full" />
						<div className="skeleton h-2.5 w-4/5 rounded-full" />
					</div>
					<div className="space-y-2.5">
						<div className="skeleton h-3 w-1/2 rounded-full" />
						<div className="skeleton h-2.5 w-full rounded-full" />
						<div className="skeleton h-2.5 w-3/5 rounded-full" />
					</div>
					<div className="space-y-2.5">
						<div className="skeleton h-3 w-2/3 rounded-full" />
						<div className="skeleton h-2.5 w-full rounded-full" />
						<div className="skeleton h-2.5 w-2/3 rounded-full" />
					</div>
				</div>
			</div>
		</div>
	);
}
