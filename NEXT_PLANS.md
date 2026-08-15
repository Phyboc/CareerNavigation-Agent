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

## The goal — a true career-navigation agent

The app analyzes well, but today it is a *reporter*: it tells the student where they stand and then stops. A true career-navigation agent should do more:

1. **Talk** — stream replies token-by-token instead of one blob after a spinner.
2. **Route** — pick the right specialist for each question: career mentor, resume reviewer, or study planner (intent classifier).
3. **Interview** — build the profile conversationally instead of only through the static form.
4. **Navigate** — always know the single best next move, surface it prominently, and deep-link to the right page.
5. **Remember** — reference the student's progress over time ("up from 42% to 61%").
6. **Map more careers** — navigation is only as good as the map (4 career paths is thin).

The phases below deliver all of that in dependency order. Each phase ends with `npm run lint` + `npm run build` green (and `npm test` once Phase 1 lands).

---

## Phase 1 — Test foundation (was NEXT_PLANS Item C)

Lock in the deterministic engine before building on top of it.

- **Add `vitest`** as a devDependency (ESM-native, works with the extensionless imports and JSX). Add `"test": "vitest run"` to `package.json`.
- Test files (co-located `*.test.js`):
  - `lib/analyzer.test.js` — `buildAnalysis` deterministic shape, readiness math, missing-skills computation, `mergeResumeAnalysis` (union + canonical matching), `analyzeResumeText` whitespace normalization ("Data \nStructures" matches).
  - `lib/resumeExtractor.test.js` — name extraction, section-aware projects (bullets, inline lists), `dedupeProjects` fuzzy dedupe, heading junk exclusion ("PROJECTS" → no `"S"`).
  - `lib/aiProvider.test.js` — `extractJson` (fenced/plain/raw), `toCamelKeys`, entry normalization (education objects → strings, plausible-skill filter), `callLLM` timeout/retry/quota-cache with mocked `fetch`.
  - `lib/rateLimit.test.js` — window reset, limit exceeded, cleanup.
- These would have caught the duplicate-export bug, the object-shaped education crash, and the quota-retry waste.

## Phase 2 — Streaming chat replies (was NEXT_PLANS Item A)

- **`lib/aiProvider.js`**: add a `stream` option to `callLLM`. When set, include `stream: true` in the payload, skip JSON parsing/`extractJson`, and return the **raw fetch `Response`** so the route can pipe `response.body`. Keep the existing timeout (applies until first byte) and quota fast-fail (throw → route falls back). Retry logic only applies before the stream starts.
- **`app/api/chat/route.js`**: after the intent routing (Phase 3), call the LLM with `stream: true` and return `new Response(readableStream)` with `Content-Type: text/event-stream`. Pipe Groq's SSE through a `TransformStream` that parses each `data:` line, extracts `choices[0].delta.content`, and forwards **plain text chunks** (ignores `[DONE]` and non-delta lines) — keeps the client parser trivial. On immediate failure (quota/error) return the existing JSON error so the client keeps its current error UI.
- **`components/ChatAgent.jsx`**: replace `fetchJson` with raw `fetch` + `response.body.getReader()`. Decode chunks and append tokens to a **draft assistant message** rendered in the bubble while `sending` (drop the "Thinking…" dots). Keep the `AbortController` timeout. On mid-stream error: keep the partial text, append a short error line, stop.
- **Non-streaming stays** for `/api/mentor-insights` (report generation) — only chat streams.
- Chat route remains `runtime = "nodejs"`.

## Phase 3 — Multi-agent routing (was NEXT_PLANS Item B)

- **Intent classifier** at the top of `/api/chat`: a tiny `callLLM` call (`raw: true`, `maxTokens: 20`, temperature 0) asking for exactly one of `["career", "resume", "study"]` based on the last user message. Parse leniently (first matching label), fall back to `career` on failure or when the quota fast-fail is active (skip the classifier entirely — free).
- **Extend `summarizeAnalysis`** (route + `lib/mentorInsights.js` can stay as-is) to ground all three agents:
  - add `roadmap` (phase titles + items), `weeklySchedule` (compact: day → focus), `resumeAnalysis` (matchScore, careerFit, detectedSkills, missingSkills, suggestions, projects).
- **Three system prompts**:
  - `career` — existing mentor (goal/readiness/gaps/matches) + `nextStep` (Phase 5).
  - `resume` — resume reviewer: critiques bullet quality, impact metrics, keyword coverage against required skills; references `resumeAnalysis`.
  - `study` — study planner: turns the roadmap + weekly schedule into concrete day-by-day plans.
- Route the message to the matching prompt; keep full history so context carries across intents.
- **`components/ChatAgent.jsx`**: tag each assistant reply with its agent (badge: Career mentor / Resume reviewer / Study planner — returned by the route as a header or field). Add suggestion chips to kick off each intent ("Review my resume", "Build me a study plan").

## Phase 4 — Conversational intake (NEW)

Let the agent build the profile by asking questions, so assessment is a conversation, not a wall of inputs.

- Add an **`intake` intent** to the router (reuses chat rate limits/streaming — no new endpoint).
- Design: the client holds a `partialProfile` ({name, degree, goal, skills, projects, hours}). The intake prompt instructs the model to:
  1. Ask the next missing field conversationally (fixed order: name → goal → degree → skills → projects → hours), validating against `careerPaths` for goal;
  2. Once all fields are present, reply with a JSON marker the client can detect, e.g. `{"__profile__": {...}}` containing the completed profile.
- Client (`ChatAgent` intake mode + `/assessment` page): a **"Chat to build your profile"** button opens the intake flow; on completion it pre-fills `StudentForm`, fires `handleAnalyze`, and navigates to `/analysis` (existing plumbing — no new analysis path).
- Deterministic fallback: if the LLM is unavailable, drive the same question script with canned prompts and a small keyword parser for skills.

## Phase 5 — Proactive navigation (NEW)

The agent always knows the next best move and takes the user there.

- **`lib/analyzer.js`**: deterministic `buildNextStep(analysis)` → `{ title, description, href }`:
  - no profile → "Complete the assessment" → `/assessment`;
  - `missingSkills` non-empty → "Close your top gap: {skill}" → `/roadmap`;
  - no projects → "Build your first portfolio project" → `/projects`;
  - no resume analysis → "Check your resume against the role" → `/resume`;
  - readiness ≥ 80 → "Start mock interviews and applications" → `/chat`.
- Include `nextStep` in the `buildAnalysisFromProfile` result; surface it in a **prominent "Your next move" card** at the top of `/analysis`.
- **Lightweight markdown renderer** in `ChatAgent` (bold, inline code, `[label](/path)` links) so the career agent can deep-link into the app; the career prompt references `nextStep` and may output links.
- After each reply show 2–3 **suggestion chips** (e.g. "What should I learn first?", "Review my resume", "Build me a study plan").

## Phase 6 — Progress-aware guidance (NEW)

- `AnalysisContext` already persists `history` (savedAt, goal, readinessScore). Pass it to `ChatAgent`, include the last ~5 entries in the chat grounding, and let the career prompt reference improvement/decline ("up from 42% to 61% — close {gap} next").
- `summarizeAnalysis` gains a compact `progress` array.

## Phase 7 — Expanded career map (NEW, data-only)

- `lib/careerPaths.js`: add ~6 paths with required skill lists, e.g. **Data Analyst, DevOps Engineer, Backend Engineer, Mobile Developer, Cybersecurity Analyst, Cloud Engineer**.
- `lib/analyzer.js`: add matching entries to `buildResources`, `buildProjectRecommendations`, and the `prioritySkills` priority map for new goals (fallbacks exist, but give real content).
- `components/StudentForm.jsx` goal `<select>`: render options from `careerPaths` keys instead of hardcoded 4.
- Scoring/readiness math is list-based, so this is data entry + a form tweak — no engine changes.

## Phase 8 — Cleanup & branding (was NEXT_PLANS Item D)

- **Dev/build mismatch**: drop `--webpack` from the `dev` script (Turbopack dev — `next.config.ts` already has `turbopack.root`). Verify `npm run dev` before removing.
- **README**: update the feature table (streaming, multi-agent chat, conversational intake, next-step navigation, expanded career paths) and the "Recently Completed" section.
- **Branding**: replace the default `app/favicon.ico` with a branded teal compass mark (SVG `app/icon.svg`), add an `opengraph-image` for social shares (static asset or dynamic `opengraph-image.tsx`).

---

## Cross-cutting notes

- **Rate limits**: multi-agent + intake add LLM calls. The classifier is ~20 tokens; the existing 20/min chat limit and the daily-quota fast-fail keep things bounded. Bump the chat limit only if real usage demands it.
- **Fallbacks everywhere**: every new AI surface (intake, routing, streaming) must degrade to the deterministic path — that's the project's core reliability principle.
- **Keep AI server-only**: no new client-bundle imports of `lib/aiProvider`; all new AI work lives in route handlers.
- **Tests first**: Phase 1 lands before Phases 2–7 touch shared code, so regressions surface immediately.
