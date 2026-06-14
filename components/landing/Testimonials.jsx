const testimonials = [
	{
		name: "Priya Sharma",
		role: "CS Student, AI Engineer track",
		quote: "CareerCompass AI helped me understand exactly which ML skills I was missing. The roadmap made my study plan feel achievable."
	},
	{
		name: "Arjun Mehta",
		role: "Final year, Software Engineer",
		quote: "The resume analyzer and project recommendations gave me a clear path to strengthen my portfolio before placements."
	},
	{
		name: "Sneha Patel",
		role: "Data Science aspirant",
		quote: "I loved the AI mentor insights — it felt like having a career coach explain my next steps in plain language."
	}
];

export default function Testimonials() {
	return (
		<section>
			<div className="text-center">
				<p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">Testimonials</p>
				<h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Trusted by students</h2>
			</div>
			<div className="mt-10 grid gap-4 md:grid-cols-3">
				{testimonials.map(item => (
					<blockquote key={item.name} className="rounded-3xl border border-white/10 bg-white/5 p-6">
						<p className="text-sm leading-7 text-slate-300">&ldquo;{item.quote}&rdquo;</p>
						<footer className="mt-4 border-t border-white/10 pt-4">
							<p className="text-sm font-semibold text-white">{item.name}</p>
							<p className="text-xs text-slate-500">{item.role}</p>
						</footer>
					</blockquote>
				))}
			</div>
		</section>
	);
}
