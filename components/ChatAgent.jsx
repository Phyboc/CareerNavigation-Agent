"use client";

import { useEffect, useRef, useState } from "react";

import { useAnalysis } from "../context/AnalysisContext";
import SectionCard from "./ui/SectionCard";

const STORAGE_KEY = "careercompass-chat";

const WELCOME_MESSAGE = {
	role: "assistant",
	agent: "career",
	content:
		"Hi, I'm your AI career mentor. Ask me about your skill gaps, career matches, study plan, or what to learn next."
};

const AGENT_LABELS = {
	career: "Career mentor",
	resume: "Resume reviewer",
	study: "Study planner"
};

const QUICK_PROMPTS = [
	"Which career fits me best?",
	"Review my resume",
	"Build me a study plan"
];

// Minimal markdown renderer for chat replies: `code`, **bold**, and
// [label](/path) links (only relative app routes and http(s) are rendered).
function renderInline(text) {
	const nodes = [];
	const codeParts = String(text).split(/`([^`]+)`/g);
	codeParts.forEach((part, index) => {
		if (index % 2 === 1) {
			nodes.push(
				<code key={`c${nodes.length}`} className="rounded bg-slate-800 px-1.5 py-0.5 text-[0.85em] text-cyan-300">
					{part}
				</code>
			);
			return;
		}
		const boldParts = part.split(/\*\*([^*]+)\*\*/g);
		boldParts.forEach((boldPart, boldIndex) => {
			if (boldIndex % 2 === 1) {
				nodes.push(
					<strong key={`b${nodes.length}`} className="font-semibold text-slate-100">
						{boldPart}
					</strong>
				);
			} else if (boldPart) {
				nodes.push(boldPart);
			}
		});
	});
	return nodes;
}

function renderRichText(content) {
	const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
	const nodes = [];
	let lastIndex = 0;
	let match;
	while ((match = linkPattern.exec(content)) !== null) {
		if (match.index > lastIndex) nodes.push(...renderInline(content.slice(lastIndex, match.index)));
		const [label, href] = [match[1], match[2]];
		const safe = href.startsWith("/") || href.startsWith("https://") || href.startsWith("http://");
		nodes.push(
			safe ? (
				<a
					key={`l${nodes.length}`}
					href={href}
					target={href.startsWith("/") ? undefined : "_blank"}
					rel={href.startsWith("/") ? undefined : "noopener noreferrer"}
					className="text-cyan-600 underline underline-offset-2 hover:text-cyan-500 dark:text-cyan-400"
				>
					{label}
				</a>
			) : (
				label
			)
		);
		lastIndex = match.index + match[0].length;
	}
	if (lastIndex < content.length) nodes.push(...renderInline(content.slice(lastIndex)));
	return nodes.length > 0 ? nodes : content;
}

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
	// In-progress assistant reply, shown token-by-token while the stream runs.
	const [draft, setDraft] = useState("");
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

	const handleSend = async (override) => {
		const text = (override ?? input).trim();
		if (!text || sending) return;

		const nextMessages = [...messages, { role: "user", content: text }];
		setMessages(nextMessages);
		setInput("");
		setSending(true);
		setError("");
		setDraft("");

		// The timeout only guards reaching the first token – once the stream
		// starts it is cleared, so long answers can flow without being cut off.
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 30000);
		let acc = "";
		let firstChunk = false;
		let agentHeader = "career";

		try {
			const response = await fetch("/api/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ messages: nextMessages, analysis }),
				signal: controller.signal
			});
			agentHeader = response.headers.get("x-agent") || "career";

			if (!response.ok) {
				let message = "The mentor could not reply. Try again.";
				try {
					const payload = await response.json();
					if (payload?.error) message = payload.error;
				} catch {
					// non-JSON error body – keep the default message
				}
				throw new Error(message);
			}
			if (!response.body) {
				throw new Error("Streaming is not supported by this browser.");
			}

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				if (!firstChunk) {
					firstChunk = true;
					clearTimeout(timeout);
				}
				acc += decoder.decode(value, { stream: true });
				setDraft(acc);
			}

			setMessages(previous => [
				...previous,
				{
					role: "assistant",
					agent: agentHeader,
					content: acc.trim() || "I could not think of a reply. Try asking again."
				}
			]);
		} catch (caughtError) {
			console.error("Chat request failed:", caughtError);
			if (acc.trim()) {
				// Stream broke partway – keep the partial reply and flag it.
				setMessages(previous => [
					...previous,
					{
						role: "assistant",
						agent: agentHeader,
						content: `${acc.trim()}\n\n— reply interrupted`
					}
				]);
			} else {
				setError(caughtError instanceof Error ? caughtError.message : "The mentor could not reply. Try again.");
			}
		} finally {
			clearTimeout(timeout);
			setDraft("");
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
			<div className="mt-6 flex h-[420px] flex-col overflow-hidden rounded-[28px] border border-slate-700/20 bg-white/80">
				<div className="flex-1 space-y-4 overflow-y-auto p-5">
					{messages.map((message, index) => {
						const isUser = message.role === "user";
						return (
							<div key={`${message.role}-${index}`} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>						<div className={isUser ? "flex max-w-[85%] flex-col items-end" : "max-w-[85%]"}>
							{!isUser && message.agent ? (
								<span className="mb-1 inline-block rounded-full border border-cyan-600/25 bg-cyan-600/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-700">
									{AGENT_LABELS[message.agent] || AGENT_LABELS.career}
								</span>
							) : null}
							<div
								className={`rounded-2xl px-4 py-3 text-sm leading-6 whitespace-pre-wrap ${
									isUser
										? "rounded-br-md bg-gradient-to-r from-cyan-500 to-cyan-700 text-white"
										: "rounded-bl-md border border-slate-700/20 bg-slate-900/50 text-slate-300"
								}`}
							>
								{isUser ? message.content : renderRichText(message.content)}
							</div>
						</div>
							</div>
						);
					})}
					{sending ? (
						<div className="flex justify-start">
							{draft ? (
								<div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-md border border-slate-700/20 bg-slate-900/50 px-4 py-3 text-sm leading-6 text-slate-300">
									{draft}
									<span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-cyan-600 align-middle" />
								</div>
							) : (
								<div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-slate-700/20 bg-slate-900/50 px-4 py-3 text-sm text-slate-500">
									<span className="h-2 w-2 animate-pulse rounded-full bg-cyan-600" />
									<span className="h-2 w-2 animate-pulse rounded-full bg-cyan-600 [animation-delay:150ms]" />
									<span className="h-2 w-2 animate-pulse rounded-full bg-cyan-600 [animation-delay:300ms]" />
									<span className="ml-1">Thinking…</span>
								</div>
							)}
						</div>
					) : null}
					<div ref={bottomRef} />
				</div>

				{error ? (
					<div className="border-t border-rose-600/20 px-5 py-2.5 text-sm text-rose-800 bg-rose-600/10">
						{error}
					</div>
				) : null}

				{messages.length <= 4 && !sending ? (
					<div className="flex flex-wrap gap-2 border-t border-slate-700/20 px-4 py-3">
						{QUICK_PROMPTS.map(prompt => (
							<button
								key={prompt}
								type="button"
								onClick={() => handleSend(prompt)}
								className="rounded-full border border-cyan-600/25 bg-cyan-600/5 px-3.5 py-1.5 text-xs font-medium text-cyan-800 transition hover:bg-cyan-600/15"
							>
								{prompt}
							</button>
						))}
					</div>
				) : null}

				<div className="flex items-end gap-3 border-t border-slate-700/20 p-4">
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
						className="flex-1 resize-none rounded-2xl border border-slate-700/25 bg-white px-4 py-3 text-sm leading-6 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-600/60 focus:bg-white"
					/>
					<button
						type="button"
						onClick={handleSend}
						disabled={sending || !input.trim()}
						className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-cyan-700 px-5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 dark:from-cyan-600 dark:to-cyan-900"
					>
						{sending ? "Sending…" : "Send"}
					</button>
					<button
						type="button"
						onClick={clearConversation}
						className="inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-slate-700/25 bg-white px-4 text-sm font-medium text-slate-300 transition hover:bg-slate-900"
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
