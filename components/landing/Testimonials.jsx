const testimonials = [
	{
		name: "Priya Sharma",
		role: "Computer Science Student, AI Track",
		quote: "CareerCompass AI helped me understand exactly which ML skills I was missing. The roadmap made my study plan feel structured and achievable.",
		initials: "PS"
	},
	{
		name: "Arjun Mehta",
		role: "Final Year Student, SWE Track",
		quote: "The resume analyzer and project recommendations gave me a clear path to strengthen my portfolio and prepare for corporate placements.",
		initials: "AM"
	},
	{
		name: "Sneha Patel",
		role: "Data Science Aspirant",
		quote: "I loved the AI mentor insights — it felt like having a senior career coach explain my next steps in plain language without jargon.",
		initials: "SP"
	}
];

export default function Testimonials() {
	return (
		<section className="py-6">
			<div className="text-center">
				<p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-400 font-display">Testimonials</p>
				<h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">What our students say</h2>
			</div>
			<div className="mt-10 grid gap-6 md:grid-cols-3">
				{testimonials.map(item => (
					<blockquote
						key={item.name}
						className="rounded-3xl border border-white/5 bg-slate-900/20 p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:border-cyan-500/20 hover:bg-slate-900/35 hover:shadow-[0_15px_30px_rgba(6,182,212,0.06)]"
					>
						<p className="text-sm leading-relaxed text-slate-300 italic">&ldquo;{item.quote}&rdquo;</p>
						<footer className="mt-6 border-t border-white/5 pt-4 flex items-center gap-3">
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 font-display text-sm font-bold text-slate-950">
								{item.initials}
							</div>
							<div>
								<p className="text-sm font-bold text-white leading-tight">{item.name}</p>
								<p className="text-xs text-slate-500 leading-tight mt-0.5">{item.role}</p>
							</div>
						</footer>
					</blockquote>
				))}
			</div>
		</section>
	);
}
