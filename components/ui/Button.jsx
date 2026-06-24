import Link from "next/link";

const variants = {
	primary:
		"bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500 text-slate-950 shadow-[0_4px_20px_rgba(6,182,212,0.25)] hover:brightness-110 active:scale-[0.98] active:translate-y-[0.5px]",
	secondary:
		"border border-cyan-500/30 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/25 hover:border-cyan-500/50 active:scale-[0.98] active:translate-y-[0.5px]",
	ghost: "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 active:scale-[0.98] active:translate-y-[0.5px]"
};

export default function Button({ children, variant = "primary", className = "", href, ...props }) {
	const classes = `inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition-all duration-250 ease-out disabled:cursor-not-allowed disabled:opacity-70 ${variants[variant] || variants.primary} ${className}`;

	if (href) {
		return (
			<Link href={href} className={classes} {...props}>
				{children}
			</Link>
		);
	}

	return (
		<button type="button" className={classes} {...props}>
			{children}
		</button>
	);
}
