"use client";

import { motion } from "motion/react";

/**
 * Scroll-triggered reveal wrapper — fades content up as it enters the viewport.
 * Use `stagger` with index on parent sections to cascade children one by one.
 */
export default function Reveal({ children, delay = 0, className = "" }) {
	return (
		<motion.div
			className={className}
			initial={{ opacity: 0, y: 24 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: "-80px" }}
			transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
		>
			{children}
		</motion.div>
	);
}
