# Next Plans — Items 4–8 (not yet implemented)

Status of items 1–3 (persistence + progress, rate limits + file caps, personalized
roadmap/resources): **IMPLEMENTED and verified** — see chat history.

---

## Item 4 — Full UI redesign

**Status: IMPLEMENTED and verified live (see chat history).** Remaining optional: `motion` scroll animations, custom favicon asset, README copy updates.

### Packages needed: NONE required
- **Tailwind CSS v4** is already installed and configured (`globals.css` uses `@import "tailwindcss"` + `@theme`).
- Fonts already load via `next/font` (`Geist`, `Geist_Mono`, `Outfit`).
- Icons are inline SVGs — no icon library needed (the audit explicitly warns against `lucide-react` as the "generic AI" default).
- All recommended changes are achievable with Tailwind utilities + the existing keyframes in `globals.css`.

**Optional (only if you want scroll-driven motion):** add `motion` (framer-motion successor) as a dependency. Defer until the static redesign is done — motion is polish, not structure.

### Plan (apply in this order, smallest risk first)

1. **Color cleanup** (globals.css + spot fixes):
   - Commit to ONE accent: cyan. Remove/reduce the blue second accent in gradients (`from-cyan-400 to-blue-500` → `from-cyan-400 to-cyan-500` or a teal support tone). Audit `components/ui/Button.jsx`, `Navbar.jsx`, `Hero.jsx`, `ReadinessScore.jsx`, `ChatAgent.jsx`.
   - Tint shadows cyan instead of pure black: replace `shadow-[0_20px_60px_rgba(2,6,23,0.22)]` style shadows with cyan-tinted equivalents.
   - Deep navy instead of flat `#030712`: shift `--background` to something like `#050d1a`/`#071120` and update the radial gradients + dot-grid opacity down (0.85 → ~0.4).

2. **Typography**:
   - Sentence-case eyebrows: replace ALL `uppercase tracking-[0.32em] text-cyan-300` eyebrows (in `SectionCard`, `Roadmap`, `SkillGap`, `StudyPlan`, `ResourceCards`, page headers, `StudentForm`) with sentence-case, normal tracking, slightly larger, dimmer (`text-xs font-medium text-slate-400`).
   - Fix the invalid `text-wrap:balance` class in `Hero.jsx` → `text-wrap: balance`.
   - Add `text-wrap: pretty` to body paragraphs.

3. **Layout / cards**:
   - Break the 3-equal-column grids: `Features` (landing), `CareerMatches`, `ProjectRecommendations` → asymmetric 2+1 / zig-zag layouts. Bottom-align card CTAs.
   - Remove `hover:-translate-y-1` from EVERY card — apply hover only to primary cards (e.g., CareerMatches), keep the rest flat.
   - Vary border-radius: containers `rounded-[32px]`, inner cards `rounded-2xl/3xl` (mostly already the case — standardize).

4. **Honest data**: `SkillGap` shows fabricated gap percentages (`Math.max(35, 100 - index * 18)`). Replace with real priority rank (1, 2, 3…) or plain chips — no fake numbers.

5. **States**:
   - Replace `LoadingState` spinner banner with skeleton loaders matching layout shape (pure CSS shimmer).
   - Real `<label htmlFor>` on all `StudentForm` inputs (currently `<span>`).
   - Add `focus-visible` rings globally (Tailwind v4: `@utility` or base layer rule).

6. **Accessibility / polish**:
   - Custom `app/not-found.jsx` (branded 404).
   - Skip-to-content link in `layout.tsx`.
   - Real favicon (`app/favicon.ico` → branded asset), `metadata` og:image.
   - Footer: keep 3 columns (already fine), fix dead `#` links (Privacy/Terms → real pages or remove).
   - Copy: remove AI clichés ("Navigate your career with confidence", "clarity" repetition) — plain, specific language.

7. **Optional motion pass**: `motion` package, stagger section reveals on the landing page + analysis page. Only after 1–6.

---

## Item 5 — Streaming chat replies

- **Server** (`app/api/chat/route.js`): call Groq with `stream: true` in the payload (add a `stream` option to `callLLM`), return `new Response(stream)` with `Content-Type: text/event-stream`, piping Groq's SSE `choices[0].delta.content` chunks.
- **Client** (`components/ChatAgent.jsx`): read the stream with `fetch` + `response.body.getReader()`, parse SSE `data:` lines, append tokens to a buffer shown as the assistant bubble while `sending`. Keep the existing timeout via `AbortController`.
- **Fallback**: on stream error mid-way, keep partial text + static error line.
- Keep the non-streaming path for `/api/mentor-insights` (report) — only chat streams.

---

## Item 6 — Multi-agent routing

- Add an intent classifier step at the top of `/api/chat`: a tiny `callLLM` call with `maxTokens: 20` asking the model to return one of `["career", "resume", "study"]` based on the last user message (cheap; falls back to `career` on failure).
- Three system prompts:
  - `career` — existing mentor (goal/readiness/gaps).
  - `resume` — resume reviewer: takes `resumeAnalysis` (projects/descriptions, detected/missing skills) and critiques bullet quality, impact metrics, keyword coverage.
  - `study` — study planner: takes the roadmap + weekly schedule and turns questions into day-by-day plans.
- Route the message to the matching prompt; keep history so context carries across intents.

---

## Item 7 — Automated tests

- **Add `vitest`** as a devDependency (ESM-native, works with the extensionless imports and JSX; `node:test` would fight the bundler-resolved imports). Add `"test": "vitest run"` to `package.json`.
- Test files (co-located `*.test.js` or `lib/__tests__/`):
  - `lib/analyzer.test.js` — `buildAnalysis` deterministic shape, readiness math, missing-skills computation, `mergeResumeAnalysis` (union + canonical matching), `analyzeResumeText` whitespace normalization ("Data \nStructures" matches).
  - `lib/resumeExtractor.test.js` — name extraction, section-aware projects (bullets, inline lists), `dedupeProjects` fuzzy dedupe, heading junk exclusion ("PROJECTS" → no `"S"`).
  - `lib/aiProvider.test.js` — `extractJson` (fenced/plain/raw), `toCamelKeys`, entry normalization (education objects → strings, plausible-skill filter), `callLLM` timeout/retry with mocked `fetch`.
  - `lib/rateLimit.test.js` — window reset, limit exceeded, cleanup.
- These would have caught the duplicate-export bug and the object-shaped education crash.

---

## Item 8 — Minor cleanup

- **Dev/build mismatch**: `package.json` runs `next dev --webpack` while build uses Turbopack. Either drop `--webpack` (use Turbopack in dev — faster) or keep it and note the divergence. Recommend dropping `--webpack` after confirming Turbopack dev works.
- **README**: update feature table (chat agent, structured projects, live metrics, rate limits) and the "Recent Updates" section.
- **Docs**: `FIX_PLAN.md` items are implemented — trim to a status note or delete; keep `NEXT_PLANS.md` as the living roadmap.
- Remove `hydrated: true` if unused (it's in the context value but nothing reads it — verify first).
