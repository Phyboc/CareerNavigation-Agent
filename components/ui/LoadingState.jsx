export default function LoadingState({ message = "Analyzing your profile..." }) {
	return (
		<div className="rounded-[28px] border border-cyan-400/20 bg-cyan-400/10 px-5 py-4 shadow-[0_16px_40px_rgba(8,145,178,0.12)]">
			<div className="flex items-center gap-3">
				<div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-300 border-t-transparent" />
				<p className="text-sm leading-6 text-cyan-50">{message}</p>
			</div>
		</div>
	);
}
