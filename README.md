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
| **Career Assessment** | Profile form capturing skills, projects, degree, and career goals |
| **Readiness Score** | Percentage score based on skill match, projects, and study hours |
| **Career Match Ranking** | Top 3 career matches with required/missing skills and effort estimates |
| **Skill Gap Analysis** | Existing, missing, and priority skills with visual breakdown |
| **AI Mentor Insights** | Natural language guidance generated from your profile |
| **Career Journey** | Visual progression from Student to Industry Ready |
| **Learning Roadmap** | Four-phase structured plan |
| **Weekly Study Plan** | Day-by-day schedule based on available hours |
| **Resume Analyzer** | Strengths, gaps, recommendations, and career fit |
| **Project Recommendations** | Beginner, intermediate, and advanced portfolio projects |
| **Export Career Report** | Downloadable markdown report of your full analysis |

---

## Architecture

```
app/
├── page.jsx              # Landing page
├── assessment/page.jsx   # Student profile form
├── analysis/page.jsx     # Readiness, matches, gaps, AI mentor
├── resume/page.jsx       # Resume analyzer
├── roadmap/page.jsx      # Roadmap, study plan, resources
├── projects/page.jsx     # Project recommendations
└── api/analyze/route.js  # Analysis API endpoint

context/
└── AnalysisContext.jsx   # Shared state + sessionStorage

components/
├── Navbar.jsx, Footer.jsx
├── AIMentorInsights.jsx, CareerJourney.jsx
├── landing/              # Landing page sections
└── ui/                   # Design system primitives

lib/
├── analyzer.js           # Core analysis engine
├── mentorInsights.js     # AI mentor text generation
└── exportReport.js       # Markdown report export
```

### Data Flow

1. User completes assessment on `/assessment`
2. Profile sent to `/api/analyze` → `analyzeCareerProfile()` in `lib/analyzer.js`
3. Results stored in `AnalysisContext` + `sessionStorage`
4. All pages read from shared context

---


## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS 4
- **Language:** JavaScript (JSX)
- **State:** React Context + sessionStorage
- **Analysis:** Rule-based engine in `lib/analyzer.js`

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

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

## Future Roadmap

- [ ] Azure OpenAI integration for dynamic AI mentor responses
- [ ] User authentication and persistent profiles
- [ ] PDF export for career reports
- [ ] Integration with LinkedIn and job board APIs
- [ ] Multi-language support
- [ ] Admin dashboard for career counselors

## Recent Updates

- Added `generateResumeAnalysis` import in `lib/analyzer.js` to enhance resume processing capabilities.
- Implemented defensive checks in `components/AIMentorInsights.jsx` to gracefully handle missing mentor data and prevent runtime errors.
- Updated `lib/mentorInsights.js` to always return a default object (`{ paragraphs: [], highlight: {} }`) on failures, ensuring stable UI rendering.

---

## License

MIT
