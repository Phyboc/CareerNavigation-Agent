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

## Remaining plans

## Item A — Streaming chat replies

- **Server** (`app/api/chat/route.js`): call Groq with `stream: true` in the payload (add a `stream` option to `callLLM`), return `new Response(stream)` with `Content-Type: text/event-stream`, piping Groq's SSE `choices[0].delta.content` chunks.
- **Client** (`components/ChatAgent.jsx`): read the stream with `fetch` + `response.body.getReader()`, parse SSE `data:` lines, append tokens to a buffer shown as the assistant bubble while `sending`. Keep the existing timeout via `AbortController`.
- **Fallback**: on stream error mid-way, keep partial text + static error line.
- Keep the non-streaming path for `/api/mentor-insights` (report) — only chat streams.

## Item B — Multi-agent routing

- Add an intent classifier step at the top of `/api/chat`: a tiny `callLLM` call with `maxTokens: 20` asking the model to return one of `["career", "resume", "study"]` based on the last user message (cheap; falls back to `career` on failure).
- Three system prompts:
  - `career` — existing mentor (goal/readiness/gaps).
  - `resume` — resume reviewer: takes `resumeAnalysis` (projects/descriptions, detected/missing skills) and critiques bullet quality, impact metrics, keyword coverage.
  - `study` — study planner: takes the roadmap + weekly schedule and turns questions into day-by-day plans.
- Route the message to the matching prompt; keep history so context carries across intents.

## Item C — Automated tests

- **Add `vitest`** as a devDependency (ESM-native, works with the extensionless imports and JSX; `node:test` would fight the bundler-resolved imports). Add `"test": "vitest run"` to `package.json`.
- Test files (co-located `*.test.js` or `lib/__tests__/`):
  - `lib/analyzer.test.js` — `buildAnalysis` deterministic shape, readiness math, missing-skills computation, `mergeResumeAnalysis` (union + canonical matching), `analyzeResumeText` whitespace normalization ("Data \nStructures" matches).
  - `lib/resumeExtractor.test.js` — name extraction, section-aware projects (bullets, inline lists), `dedupeProjects` fuzzy dedupe, heading junk exclusion ("PROJECTS" → no `"S"`).
  - `lib/aiProvider.test.js` — `extractJson` (fenced/plain/raw), `toCamelKeys`, entry normalization (education objects → strings, plausible-skill filter), `callLLM` timeout/retry/quota-cache with mocked `fetch`.
  - `lib/rateLimit.test.js` — window reset, limit exceeded, cleanup.
- These would have caught the duplicate-export bug, the object-shaped education crash, and the quota-retry waste.

## Item D — Minor cleanup

- **Dev/build mismatch**: `package.json` runs `next dev --webpack` while build uses Turbopack. Either drop `--webpack` (use Turbopack in dev — faster) or keep it and note the divergence. Recommend dropping `--webpack` after confirming Turbopack dev works.
- **README**: update feature table (chat agent, dark mode, structured projects, live metrics, rate limits, motion) and the "Recent Updates" section.
- **Favicon**: `app/favicon.ico` is the default Next asset — replace with a branded teal compass mark; add an `opengraph-image` for social shares.
- **Tests**: see Item C.
