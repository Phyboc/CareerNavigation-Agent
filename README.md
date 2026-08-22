# CareerCompass AI

**Your Personal AI Career Mentor**

CareerCompass AI is an AI-powered career guidance platform that helps students discover their ideal career path, identify skill gaps, and build a personalized roadmap for success.

🚀 **[Live Demo](https://careernavigation-agent.netlify.app/)**

Built for the **Microsoft Agents League Hackathon**.

---

## Problem Statement

Students often struggle to:

- Choose a career path with confidence
- Understand their readiness for target roles
- Identify missing skills quickly
- Create a structured learning plan

CareerCompass AI solves these challenges through intelligent analysis, personalized recommendations, and AI mentor guidance.

---

## Features

| Feature | Description |
|---------|-------------|
| **Career Assessment** | Profile form capturing skills, projects, degree, and career goals, with live readiness preview |
| **Readiness Score** | Percentage score based on skill match, projects, and study hours |
| **Career Match Ranking** | Top 3 career matches with required/missing skills and effort estimates |
| **Skill Gap Analysis** | Existing, missing, and priority skills with visual breakdown |
| **AI Mentor Insights** | Natural language guidance generated from your profile (Groq-powered) |
| **AI Mentor Chat** | Conversational career mentor grounded in your profile, roadmap, and gaps |
| **Streaming Replies** | Mentor answers appear token-by-token as they are generated (Groq SSE) |
| **Multi-Agent Routing** | An intent classifier routes questions to a career mentor, resume reviewer, or study planner |
| **Conversational Intake** | Build your profile by chatting — the mentor asks one question at a time and pre-fills the assessment |
| **Next-Step Navigation** | A deterministic "Your next move" guides you to the single best action (assess → gaps → projects → resume → apply) |
| **Progress-Aware Mentor** | The chat remembers your score history and acknowledges improvement over time |
| **Resume Analyzer** | Upload a PDF or paste text — extracts name, structured projects, education, certifications, and skills; AI + deterministic merge for reliable keyword detection |
| **Project Recommendations** | Beginner, intermediate, and advanced portfolio projects |
| **Learning Roadmap** | Personalized four-phase plan driven by your actual skill gaps |
| **Weekly Study Plan** | Day-by-day schedule based on available hours |
| **Career Journey** | Visual progression from Student to Industry Ready |
| **Export Career Report** | Downloadable markdown report of your full analysis |
| **Progress Tracking** | Score history persisted locally — re-assess to watch your readiness grow |
| **10 Career Paths** | AI Engineer, Software Engineer, Data Scientist, Full Stack, Data Analyst, DevOps, Backend, Mobile, Cybersecurity, and Cloud |
| **Dark Mode** | Light editorial theme by default, with a system-aware dark mode toggle |
| **Automated Tests** | Vitest unit tests for the analysis engine, resume extractor, AI provider, and rate limiter |

---

## Architecture

```
app/
├── page.jsx                  # Landing page
├── assessment/page.jsx       # Student profile form
├── analysis/page.jsx         # Readiness, matches, gaps, AI mentor, progress
├── resume/page.jsx           # Resume analyzer
├── roadmap/page.jsx          # Roadmap, study plan, resources
├── projects/page.jsx         # Project recommendations
├── chat/page.jsx             # AI mentor chat
├── not-found.jsx             # Custom branded 404
├── icon.svg                  # Branded teal compass favicon
└── opengraph-image.tsx       # Dynamic social-share image
└── api/
    ├── analyze/route.js      # Instant deterministic analysis
    ├── analyze/enrich/route.js  # Background AI enrichment
    ├── upload-resume/route.js   # PDF/text resume parsing + extraction
    ├── mentor-insights/route.js # AI mentor insights (static fallback)
    └── chat/route.js         # Grounded conversational mentor

context/
└── AnalysisContext.jsx       # Shared state + localStorage/sessionStorage

components/
├── Navbar.jsx, Footer.jsx    # Dark-mode toggle, skip link
├── AIMentorInsights.jsx, ChatAgent.jsx, ProfileBuilder.jsx, ResumeAnalyzer.jsx
├── landing/                  # Landing page sections
└── ui/                       # Design system primitives (Button, Badge, Reveal, …)

lib/
├── analyzer.js               # Deterministic analysis engine (sync build + async merge, next-step logic)
├── aiProvider.js             # Groq wrapper: timeouts, retries, quota cache, JSON normalization, SSE→text streaming
├── resumeExtractor.js        # Section-aware resume extraction + project dedupe
├── intake.js                 # Conversational profile intake (field-by-field script + canned fallbacks)
├── mentorInsights.js         # AI mentor text generation
├── mentorInsightsStatic.js   # Deterministic mentor fallback (client-safe)
├── rateLimit.js              # Sliding-window rate limiter
├── apiClient.js              # Timeout-aware fetch helper
└── exportReport.js           # Markdown report export

# Unit tests (Vitest) – analyzer, resumeExtractor, aiProvider, intake, rateLimit
*.test.js
```

### Data Flow

1. User completes assessment on `/assessment` via the quick form **or** the chat profile builder (resume upload also pre-fills)
2. `/api/analyze` returns an instant deterministic result; if a resume was pasted, `/api/analyze/enrich` merges AI-detected skills in the background
3. Results stored in `AnalysisContext` + `localStorage` (with session fallback)
4. All pages read from shared context; `/analysis` shows score history

### API Notes

- **Rate limits** apply per client (10–30 req/min depending on route) and uploads are capped at 15 MB / 300 KB of extracted text.
- **AI is optional**: every AI call falls back to deterministic analysis. When Groq's daily token quota is hit, the app detects the 429, caches it, and serves static results instantly for the rest of the day.
- **`/api/chat` streams**: the reply is sent as plain-text chunks (`text/plain`, `X-Agent` header tags the routing), the profile-builder mode (`mode: "intake"`) returns JSON. When the LLM is unavailable (no key, quota, timeout) the route returns a deterministic fallback reply grounded in the analysis instead of failing.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS 4, Motion (scroll reveals)
- **Language:** JavaScript (JSX)
- **State:** React Context + localStorage/sessionStorage
- **Analysis:** Rule-based engine in `lib/analyzer.js` + Groq LLM enrichment
- **PDF parsing:** `pdf-parse`

---

## Getting Started

```bash
npm install
cp .env.local.example .env.local   # if you have a Groq API key
npm run dev
```

> **Note**: `dev` runs with `--webpack` because Turbopack dev hits a React Client
> Manifest bundler bug in this Next.js version (`AnalysisProvider` not found in
> the client manifest). Production builds use Turbopack fine. Revisit dropping
> the flag after a Next upgrade.

Open [http://localhost:3000](http://localhost:3000)

The app works **without an API key** — every AI feature falls back to deterministic analysis. To enable AI mentor insights, resume enrichment, and chat, set:

```env
GROQ_API_KEY=your_key_here
# optional: GROQ_MODEL=llama-3.3-70b-versatile
```

```bash
npm run build   # Production build
npm run lint    # ESLint
npm test        # Vitest unit tests
```

---

## CI/CD

This repo uses **GitHub Actions** for continuous integration and deployment.

### Continuous Integration (`.github/workflows/ci.yml`)

On every push and pull request, GitHub runs on a clean Ubuntu machine:

1. `npm ci` (fresh install from the lockfile)
2. `npm run lint`
3. `npm test` (Vitest)
4. `npm run build`

If any step fails, the commit/PR shows a red ❌ and nothing merges broken code.

### Continuous Deployment (`.github/workflows/deploy.yml`)

On every push to `main`, the app deploys to **Netlify** through the Netlify CLI
(`netlify deploy --build`), which uses Netlify's OpenNext adapter to package the
Next.js server routes correctly.

The deploy job is **skipped until you add these GitHub secrets** (Settings →
Secrets and variables → Actions → New repository secret):

| Secret | Where to get it |
|---|---|
| `NETLIFY_AUTH_TOKEN` | Netlify dashboard → User settings → Applications → Personal access tokens |
| `NETLIFY_SITE_ID` | Netlify dashboard → your site → Site configuration → General |
| `GROQ_API_KEY` | The same key used locally (only needed if the site env var isn't set on Netlify) |

**Alternative:** skip the deploy workflow entirely and connect the repo through
the Netlify dashboard (Add new site → Import from Git). Netlify then deploys on
every push with the same OpenNext adapter — don't do both, or you'll get double
deploys.

---

## GitHub Copilot Usage

GitHub Copilot was used during development to:

- Accelerate component scaffolding and Tailwind styling
- Generate boilerplate for Next.js App Router pages
- Assist with README documentation and code structure
- Suggest improvements to the analysis engine and UI patterns

---

## Future Plans

Tracked in [`NEXT_PLANS.md`](NEXT_PLANS.md) — the living roadmap.

- [ ] **Suggestion-chips persistence** — remember dismissed prompts per conversation
- [ ] **Multi-instance rate limiting** — swap the in-memory limiter for a shared store (Redis/Upstash) before scaling out
- [ ] **More career depth** — per-role interview question banks and salary/region context for each of the 10 paths

### Recently Completed

- **True career-navigation agent upgrade**: streaming chat replies (Groq SSE → plain-text chunks), multi-agent routing with an intent classifier (career / resume-reviewer / study-planner), conversational profile intake that pre-fills and auto-runs the assessment, a deterministic "Your next move" that deep-links into the app, progress-aware mentor replies, and the career map expanded from 4 to 10 paths
- Vitest test suite (69 tests) covering the analysis engine, resume extractor, AI provider, intake, and rate limiter
- Branded teal compass favicon (`app/icon.svg`) and a dynamic Open Graph image (`app/opengraph-image.tsx`)
- AI chat agent (`/chat`) with grounded, profile-aware mentor replies
- Resume extraction overhaul: section-aware parsing, structured `{ title, description }` projects with fuzzy dedupe, AI + deterministic merge so real keywords are never reported as missing
- Instant analysis: `/api/analyze` returns in ~100ms with AI enrichment in the background
- Persistence + progress tracking (localStorage + score history)
- Rate limits, file-size caps, and timeouts on all API routes
- Groq reliability: working model default, retry on transient errors, daily-quota fast-fail, quiet fallback logs
- Full UI redesign: light editorial theme, dark mode toggle, motion reveals, custom 404, skip link, focus rings, skeleton loaders, honest skill data

---

## License

MIT
