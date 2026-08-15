"use client";

import { useEffect, useRef, useState } from "react";

const INTRO =
	"Hi! I'll help you build your career profile. Let's start — what's your full name?";

export default function ProfileBuilder({ onComplete }) {
	const [messages, setMessages] = useState([{ role: "assistant", content: INTRO }]);
	const [input, setInput] = useState("");
	const [profile, setProfile] = useState({});
	const [sending, setSending] = useState(false);
	const [error, setError] = useState("");
	const bottomRef = useRef(null);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
	}, [messages, sending]);

	const handleSend = async () => {
		const text = input.trim();
		if (!text || sending) return;

		const nextMessages = [...messages, { role: "user", content: text }];
		setMessages(nextMessages);
		setInput("");
		setSending(true);
		setError("");

		try {
			const response = await fetch("/api/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ messages: nextMessages, mode: "intake", profile }),
				signal: AbortSignal.timeout(30000)
			});
			const payload = await response.json().catch(() => ({}));
			if (!response.ok) {
				throw new Error(payload?.error || "The mentor could not reply. Try again.");
			}

			setProfile(payload.profile || {});
			setMessages(previous => [...previous, { role: "assistant", content: payload.reply || "" }]);

			if (payload.done) {
				// Profile complete – hand it to the parent to prefill + analyze.
				setTimeout(() => onComplete?.(payload.profile || {}), 500);
			}
		} catch (caughtError) {
			console.error("Profile intake failed:", caughtError);
			setError(caughtError instanceof Error ? caughtError.message : "Something went wrong. Try again.");
		} finally {
			setSending(false);
		}
	};

	const reset = () => {
		setMessages([{ role: "assistant", content: INTRO }]);
		setProfile({});
		setError("");
	};

	return (
		<div className="rounded-[32px] border border-slate-700/20 bg-white/85 p-6 shadow-[0_30px_80px_rgba(31,36,48,0.12)] backdrop-blur-md sm:p-8">
			<div className="flex flex-col gap-2 border-b border-slate-700/20 pb-5">
				<p className="text-sm font-medium tracking-wide text-cyan-700">Profile builder</p>
				<h2 className="font-display text-2xl font-bold tracking-tight text-slate-100">Build your profile by chat</h2>
				<p className="text-sm leading-relaxed text-slate-400">
					Answer a few quick questions and we&apos;ll fill the assessment form for you.
				</p>
			</div>

			<div className="mt-5 flex h-[340px] flex-col overflow-hidden rounded-[24px] border border-slate-700/20 bg-white/80">
				<div className="flex-1 space-y-4 overflow-y-auto p-5">
					{messages.map((message, index) => {
						const isUser = message.role === "user";
						return (
							<div key={`${message.role}-${index}`} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
								<div
									className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${
										isUser
											? "rounded-br-md bg-gradient-to-r from-cyan-500 to-cyan-700 text-white"
											: "rounded-bl-md border border-slate-700/20 bg-slate-900/50 text-slate-300"
									}`}
								>
									{message.content}
								</div>
							</div>
						);
					})}
					{sending ? (
						<div className="flex justify-start">
							<div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-slate-700/20 bg-slate-900/50 px-4 py-3 text-sm text-slate-500">
								<span className="h-2 w-2 animate-pulse rounded-full bg-cyan-600" />
								<span className="h-2 w-2 animate-pulse rounded-full bg-cyan-600 [animation-delay:150ms]" />
								<span className="h-2 w-2 animate-pulse rounded-full bg-cyan-600 [animation-delay:300ms]" />
								<span className="ml-1">Thinking…</span>
							</div>
						</div>
					) : null}
					<div ref={bottomRef} />
				</div>

				{error ? (
					<div className="border-t border-rose-600/20 bg-rose-600/10 px-5 py-2.5 text-sm text-rose-800">
						{error}
					</div>
				) : null}

				<div className="flex items-end gap-3 border-t border-slate-700/20 p-4">
					<textarea
						value={input}
						onChange={event => setInput(event.target.value)}
						onKeyDown={event => {
							if (event.key === "Enter" && !event.shiftKey) {
								event.preventDefault();
								handleSend();
							}
						}}
						rows={2}
						placeholder="Type your answer…"
						className="flex-1 resize-none rounded-2xl border border-slate-700/25 bg-white px-4 py-3 text-sm leading-6 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-600/60"
					/>
					<button
						type="button"
						onClick={handleSend}
						disabled={sending || !input.trim()}
						className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-cyan-700 px-5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{sending ? "Sending…" : "Send"}
					</button>
					<button
						type="button"
						onClick={reset}
						className="inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-slate-700/25 bg-white px-4 text-sm font-medium text-slate-300 transition hover:bg-slate-900"
					>
						Reset
					</button>
				</div>
			</div>

			<p className="mt-3 text-xs text-slate-500">
				The mentor asks one question at a time and builds your profile from your answers.
			</p>
		</div>
	);
}
