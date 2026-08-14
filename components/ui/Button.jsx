import Link from "next/link";

const variants = {
	primary:
		"bg-gradient-to-r from-cyan-500 to-cyan-700 text-white shadow-[0_4px_20px_rgba(15,118,110,0.25)] hover:brightness-110 active:scale-[0.98] active:translate-y-[0.5px]",
	secondary:
		"border border-cyan-600/30 bg-cyan-600/10 text-cyan-800 hover:bg-cyan-600/20 hover:border-cyan-600/50 active:scale-[0.98] active:translate-y-[0.5px]",
	ghost: "border border-slate-800 bg-white text-slate-200 hover:bg-slate-900 hover:border-slate-700 active:scale-[0.98] active:translate-y-[0.5px]"
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
