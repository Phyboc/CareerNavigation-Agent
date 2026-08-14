# CareerCompass AI

**Your Personal AI Career Mentor**

CareerCompass AI is an AI-powered career guidance platform that helps students discover their ideal career path, identify skill gaps, and build a personalized roadmap for success.

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
| **Resume Analyzer** | Upload a PDF or paste text — extracts name, structured projects, education, certifications, and skills; AI + deterministic merge for reliable keyword detection |
| **Project Recommendations** | Beginner, intermediate, and advanced portfolio projects |
| **Learning Roadmap** | Personalized four-phase plan driven by your actual skill gaps |
| **Weekly Study Plan** | Day-by-day schedule based on available hours |
| **Career Journey** | Visual progression from Student to Industry Ready |
| **Export Career Report** | Downloadable markdown report of your full analysis |
| **Progress Tracking** | Score history persisted locally — re-assess to watch your readiness grow |
| **Dark Mode** | Light editorial theme by default, with a system-aware dark mode toggle |

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
├── AIMentorInsights.jsx, ChatAgent.jsx, ResumeAnalyzer.jsx
├── landing/                  # Landing page sections
└── ui/                       # Design system primitives (Button, Badge, Reveal, …)

lib/
├── analyzer.js               # Deterministic analysis engine (sync build + async merge)
├── aiProvider.js             # Groq wrapper: timeouts, retries, quota cache, JSON normalization
├── resumeExtractor.js        # Section-aware resume extraction + project dedupe
├── mentorInsights.js         # AI mentor text generation
├── mentorInsightsStatic.js   # Deterministic mentor fallback (client-safe)
├── rateLimit.js              # Sliding-window rate limiter
├── apiClient.js              # Timeout-aware fetch helper
└── exportReport.js           # Markdown report export
```

### Data Flow

1. User completes assessment on `/assessment` (optionally prefilled by resume upload)
2. `/api/analyze` returns an instant deterministic result; if a resume was pasted, `/api/analyze/enrich` merges AI-detected skills in the background
3. Results stored in `AnalysisContext` + `localStorage` (with session fallback)
4. All pages read from shared context; `/analysis` shows score history

### API Notes

- **Rate limits** apply per client (10–30 req/min depending on route) and uploads are capped at 15 MB / 300 KB of extracted text.
- **AI is optional**: every AI call falls back to deterministic analysis. When Groq's daily token quota is hit, the app detects the 429, caches it, and serves static results instantly for the rest of the day.

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

Open [http://localhost:3000](http://localhost:3000)

The app works **without an API key** — every AI feature falls back to deterministic analysis. To enable AI mentor insights, resume enrichment, and chat, set:

```env
GROQ_API_KEY=your_key_here
# optional: GROQ_MODEL=llama-3.3-70b-versatile
```

```bash
npm run build   # Production build
npm run lint    # ESLint
```

---

## GitHub Copilot Usage

GitHub Copilot was used during development to:

- Accelerate component scaffolding and Tailwind styling
- Generate boilerplate for Next.js App Router pages
- Assist with README documentation and code structure
- Suggest improvements to the analysis engine and UI patterns

---

## Future Plans

Tracked in [`NEXT_PLANS.md`](NEXT_PLANS.md) — the living roadmap. In priority order:

- [ ] **Streaming chat replies** — token-by-token SSE streaming so mentor answers appear as they're generated (Groq `stream: true`)
- [ ] **Multi-agent routing** — an intent classifier routes chat messages to career, resume-reviewer, or study-planner agents, each with a specialized prompt
- [ ] **Automated tests** — Vitest unit tests for the analyzer, resume extractor, AI provider, and rate limiter (would have caught past bugs early)
- [ ] **Branding polish** — replace the default favicon with a branded teal compass mark, add an opengraph image
- [ ] **README/cleanup** — drop the `--webpack` dev flag once Turbopack dev is confirmed, refresh docs

### Recently Completed

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
