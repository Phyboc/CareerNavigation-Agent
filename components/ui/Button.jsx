import Link from "next/link";

const variants = {
	primary:
		"bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:brightness-110",
	secondary:
		"border border-cyan-400/25 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/20",
	ghost: "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
};

export default function Button({ children, variant = "primary", className = "", href, ...props }) {
	const classes = `inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${variants[variant] || variants.primary} ${className}`;

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
