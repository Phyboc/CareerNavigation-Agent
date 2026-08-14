"use client";

import ChatAgent from "../../components/ChatAgent";

export default function ChatPage() {
	return (
		<div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
			<div>
				<p className="text-xs font-medium tracking-wide text-cyan-200">AI mentor chat</p>
				<h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Talk to your career mentor</h1>
				<p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
					Ask questions about your analysis, skill gaps, roadmap, or what to learn next. The mentor uses your
					career profile to give personalized guidance.
				</p>
			</div>

			<ChatAgent />
		</div>
	);
}
