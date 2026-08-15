# CareerCompass AI — Living Roadmap

Status of completed work (see chat history for details and verification):

- **P0 — AI unblocked**: working Groq model + fallbacks, JSON normalization, analyzer split, resume-skill merge.
- **P1 — Lag fixes**: instant deterministic `/api/analyze` with background AI enrichment, timeouts everywhere, AI out of the client bundle, dead-code removal, StudentForm upload errors.
- **Resume fixes**: section-aware extraction (`lib/resumeExtractor.js`), structured `{ title, description }` projects with fuzzy dedupe, deterministic + AI merge, object-safe renderers.
- **Persistence + progress**: localStorage analysis + score history, progress card on `/analysis`.
- **Rate limits + file caps**: `lib/rateLimit.js` on all routes, 15 MB upload cap, 300 KB text cap.
- **Personalized roadmap/resources**: gap-driven phase 1, project-named phase 2, `skillResources` map.
- **Chat agent**: `/api/chat` grounded mentor, `/chat` page + `ChatAgent`, navbar link, sessionStorage persistence.
- **UI redesign**: light editorial theme (cream + ink + deep teal), single accent, sentence-case eyebrows, asymmetric grids, skeleton loaders, custom 404, skip link, focus rings, honest skill data.
- **Dark mode toggle**: class-based `.dark` via CSS variables, navbar sun/moon toggle, system-preference default, localStorage persistence, flash-free init script.
- **Motion**: `motion` package installed; `Reveal` component; staggered scroll reveals on landing + analysis pages.
- **Error fixes**: `data-scroll-behavior="smooth"` on `<html>`; Groq daily-quota 429 now fail-fast (cached flag) with token-budget cuts (1200→700 default, 2000→1200 resume) and quiet fallback logs.

---

## Agentic upgrade (implemented — all 8 phases shipped)

- **Phase 1 — Test foundation**: Vitest (69 tests) for `lib/analyzer`, `resumeExtractor`, `aiProvider` (incl. `groqStreamToText`), `intake`, and `rateLimit`. Exported `extractJson`/`toCamelKeys` for testability.
- **Phase 2 — Streaming chat**: `callLLM({ stream: true })` returns the raw upstream response; `/api/chat` pipes Groq SSE through `groqStreamToText` as plain-text chunks; `ChatAgent` renders tokens live via `getReader()`, keeps partial text on mid-stream errors.
- **Phase 3 — Multi-agent routing**: cheap intent classifier (`career` / `resume` / `study`, falls back to `career`), three specialist prompts grounded in roadmap/schedule/resumeAnalysis, `X-Agent` header → per-reply agent badges + quick-prompt chips.
- **Phase 4 — Conversational intake**: `lib/intake.js` field-by-field script (name → goal → degree → skills → projects → hours) with goal/hours validation and canned-question fallbacks; `/api/chat` `mode: "intake"`; `ProfileBuilder` on `/assessment` pre-fills the form and auto-runs the analysis.
- **Phase 5 — Proactive navigation**: deterministic `buildNextStep` (assess → gaps → projects → resume → apply) in the analysis payload, "Your next move" card on `/analysis`, markdown-lite chat rendering (`**bold**`, `` `code` ``, `[label](/path)` links), next-step-aware career prompt.
- **Phase 6 — Progress-aware guidance**: score `history` is sent with chat requests; the mentor references improvement/decline ("up from 42% to 61%").
- **Phase 7 — Expanded career map**: 4 → 10 paths (added Data Analyst, DevOps Engineer, Backend Engineer, Mobile Developer, Cybersecurity Analyst, Cloud Engineer) with resources, project recommendations, and priority maps; goal select and intake goal validation are data-driven; the user's selected goal is always kept in the top-3 career matches.
- **Phase 8 — Cleanup & branding**: `app/icon.svg` compass mark replaces the default favicon, dynamic `app/opengraph-image.tsx` for social shares, README refreshed.

---

## Remaining plans

- **Multi-instance rate limiting** — swap the in-memory `lib/rateLimit.js` for a shared store (Redis/Upstash) exposing the same interface before scaling out.
- **Suggestion-chips persistence** — remember dismissed quick prompts per conversation instead of re-showing them.
- **Career depth** — per-role interview question banks, salary/region context, and real job-market data for the 10 paths.
- **Dev flag divergence** — `dev` intentionally keeps `--webpack` because Turbopack dev hits a React Client Manifest bundler bug (`AnalysisProvider` not found). Drop the flag after a Next.js upgrade and re-verify.

## Cross-cutting notes

- **Fallbacks everywhere**: every AI surface (chat, intake, enrichment) degrades to the deterministic path — the project's core reliability principle.
- **AI stays server-only**: no client-bundle imports of `lib/aiProvider`; all AI work lives in route handlers.
- **Tests guard the engine**: run `npm test` before and after any analyzer changes — 69 tests cover the deterministic core.
