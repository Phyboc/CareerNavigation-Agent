"use client";

import { useEffect, useRef, useState } from "react";

import { fetchJson } from "../lib/apiClient";
import { useAnalysis } from "../context/AnalysisContext";
import SectionCard from "./ui/SectionCard";

const STORAGE_KEY = "careercompass-chat";

const WELCOME_MESSAGE = {
	role: "assistant",
	content:
		"Hi, I'm your AI career mentor. Ask me about your skill gaps, career matches, study plan, or what to learn next."
};

function loadStoredMessages() {
	try {
		const stored = sessionStorage.getItem(STORAGE_KEY);
		const parsed = stored ? JSON.parse(stored) : null;
		if (Array.isArray(parsed) && parsed.length > 0) return parsed;
	} catch {
		// fall through to the welcome message
	}
	return [WELCOME_MESSAGE];
}

export default function ChatAgent() {
	const { analysis } = useAnalysis();
	const [messages, setMessages] = useState(loadStoredMessages);
	const [input, setInput] = useState("");
	const [sending, setSending] = useState(false);
	const [error, setError] = useState("");
	const bottomRef = useRef(null);

	useEffect(() => {
		try {
			sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
		} catch {
			// sessionStorage may be unavailable
		}
	}, [messages]);

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
			const payload = await fetchJson("/api/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ messages: nextMessages, analysis }),
				timeoutMs: 30000
			});
			setMessages(previous => [
				...previous,
				{ role: "assistant", content: payload.reply || "I could not think of a reply. Try asking again." }
			]);
		} catch (caughtError) {
			console.error("Chat request failed:", caughtError);
			setError(caughtError instanceof Error ? caughtError.message : "The mentor could not reply. Try again.");
		} finally {
			setSending(false);
		}
	};

	const clearConversation = () => {
		setMessages([WELCOME_MESSAGE]);
		setError("");
	};

	return (
		<SectionCard
			eyebrow="AI Mentor Chat"
			title="Conversation with your mentor"
			description="Ask anything about your career path — replies are grounded in your profile and analysis."
		>
			<div className="mt-6 flex h-[420px] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/60">
				<div className="flex-1 space-y-4 overflow-y-auto p-5">
					{messages.map((message, index) => {
						const isUser = message.role === "user";
						return (
							<div key={`${message.role}-${index}`} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
								<div
									className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 whitespace-pre-wrap ${
										isUser
											? "rounded-br-md bg-gradient-to-r from-cyan-400 to-cyan-600 text-slate-950"
											: "rounded-bl-md border border-white/10 bg-white/5 text-slate-200"
									}`}
								>
									{message.content}
								</div>
							</div>
						);
					})}
					{sending ? (
						<div className="flex justify-start">
							<div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400">
								<span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
								<span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400 [animation-delay:150ms]" />
								<span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400 [animation-delay:300ms]" />
								<span className="ml-1">Thinking…</span>
							</div>
						</div>
					) : null}
					<div ref={bottomRef} />
				</div>

				{error ? (
					<div className="border-t border-white/10 px-5 py-2.5 text-sm text-rose-200 bg-rose-400/10">
						{error}
					</div>
				) : null}

				<div className="flex items-end gap-3 border-t border-white/10 p-4">
					<textarea
						value={input}
						onChange={(event) => setInput(event.target.value)}
						onKeyDown={(event) => {
							if (event.key === "Enter" && !event.shiftKey) {
								event.preventDefault();
								handleSend();
							}
						}}
						rows={2}
						placeholder="Ask your mentor anything…"
						className="flex-1 resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:bg-white/10"
					/>
					<button
						type="button"
						onClick={handleSend}
						disabled={sending || !input.trim()}
						className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-cyan-600 px-5 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{sending ? "Sending…" : "Send"}
					</button>
					<button
						type="button"
						onClick={clearConversation}
						className="inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 text-sm font-medium text-slate-300 transition hover:bg-white/10"
						title="Clear conversation"
					>
						Clear
					</button>
				</div>
			</div>

			<p className="mt-3 text-xs text-slate-500">
				Replies are generated by AI and may not always be accurate. Your conversation stays in this browser session.
			</p>
		</SectionCard>
	);
}
